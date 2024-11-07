import {
  DiagramBuilder,
  canvas,
  Circle as BloomCircle,
  Line as BloomLine,
  Equation as BloomEquation,
  ops,
  constraints,
  rayIntersectRect,
  Vec2,
  pow,
  add,
  sqrt,
  sub,
  div,
  mul,
  ifCond,
  eq,
} from "@penrose/bloom";
import { gt, Num } from "@penrose/core";

export interface Point {
  tag: "Point";
  x: Num;
  y: Num;
  icon: BloomCircle;
  text?: BloomEquation;
}

export interface Segment {
  tag: "Segment";
  point1: Point;
  point2: Point;
  icon: BloomLine;
  text?: BloomEquation;
}

export interface Line {
  tag: "Line";
  point1: Point;
  point2: Point;
  icon: BloomLine;
}

export interface Circle {
  tag: "Circle";
  center: Point;
  circumferential: Point;
  icon: BloomCircle;
}

export type Shape = Point | Segment | Line | Circle;

export class ConstructionDomain {
  private readonly pointRadius = 2;
  private readonly pointColor = [0, 0, 0, 1];
  private readonly lineThickness = 2;
  private readonly lineColor = [0, 0, 0, 1];
  private readonly circleThickness = 2;
  private readonly circleColor = [0, 0, 0, 1];

  private readonly width: number;
  private readonly height: number;
  public readonly db: DiagramBuilder;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.db = new DiagramBuilder(canvas(width, height), "abcd", 1);
  }

  mkPointFixed = (label: string, x: Num, y: Num): Point => {
    const x2 = this.db.input();
    const y2 = this.db.input();
    const p: Point = {
      tag: "Point",
      x: x,
      y: y,
      icon: this.db.circle({
        center: [x, y],
        r: this.pointRadius,
        fillColor: this.pointColor,
        drag: false,
      }),
    };
    p.text = this.db.equation({
      center: [x2, y2],
      string: label,
      fontSize: "8px"
    });
    this.db.ensure(constraints.equal(ops.vdist([x, y], [x2, y2]), 8));
    return p;
  };

  mkPoint = (
    label: string,
    labeled: boolean = false,
    draggable: boolean = false,
    initPos?: [number, number]
  ): Point => {
    const x1 = this.db.input({ init: initPos?.[0] });
    const y1 = this.db.input({ init: initPos?.[1] });
    const x2 = this.db.input({ init: initPos?.[0] });
    const y2 = this.db.input({ init: initPos?.[1] });
    const p: Point = {
      tag: "Point",
      x: x1,
      y: y1,
      icon: this.db.circle({
        center: [x1, y1],
        r: this.pointRadius,
        fillColor: this.pointColor,
        drag: draggable,
      }),
    };
    if (labeled) {
      p.text = this.db.equation({
        center: [x2, y2],
        string: label,
        fontSize: "8px"
      });
      this.db.ensure(constraints.equal(ops.vdist([x1, y1], [x2, y2]), 8));
    }
    return p;
  };

  private perp_point(p1: Point, p2: Point, d: Num): Vec2 {
    // Calculate the midpoint of the line segment
    const midpoint_x = div(add(p1.x, p2.x), 2);
    const midpoint_y = div(add(p1.y, p2.y), 2);
    
    // Calculate the slope of the line segment
    // add small epsilon to avoid division by zero in calculation of perpendicular slope
    const slope = add(div(sub(p2.y, p1.y), sub(p2.x, p1.x)), 0.0000001);

    // Calculate the perpendicular slope
    const perp_slope = div(-1, slope);

    // Calculate the new point
    const new_x = add(midpoint_x, div(d, sqrt(add(1, pow(perp_slope, 2)))));
    const new_y = add(mul(perp_slope, sub(new_x, midpoint_x)), midpoint_y);
    return [new_x, new_y];
  }

  mkSegment = (
    point1: Point,
    point2: Point,
    label?: string,
    labeled: boolean = false
  ): Segment => {
    const s: Segment = {
      tag: "Segment",
      point1,
      point2,
      icon: this.db.line({
        start: [point1.x, point1.y],
        end: [point2.x, point2.y],
        strokeWidth: this.lineThickness,
        strokeColor: this.lineColor,
      }),
    };
    if (labeled) {
      s.text = this.db.equation({
        center: this.perp_point(point1, point2, 5),
        string: label,
        fontSize: "8px"
      });
    }
    return s;
  };

  mkLine = (point1: Point, point2: Point): Line => {
    const p1: Vec2 = [point1.x, point1.y];
    const p2: Vec2 = [point2.x, point2.y];

    const disp = ops.vsub(p2, p1) as Vec2;
    const canvasRect: Vec2[] = [
      [this.width / 2, this.height / 2],
      [-this.width / 2, this.height / 2],
      [-this.width / 2, -this.height / 2],
      [this.width / 2, -this.height / 2],
    ];
    const start = rayIntersectRect(canvasRect, p1, disp);
    const end = rayIntersectRect(canvasRect, p1, ops.vmul(-1, disp) as Vec2);

    return {
      tag: "Line",
      point1,
      point2,
      icon: this.db.line({
        start,
        end,
        strokeWidth: this.lineThickness,
        strokeColor: this.lineColor,
        ensureOnCanvas: false,
      }),
    };
  };

  mkCircle = (center: Point, circumferential: Point): Circle => {
    return {
      tag: "Circle",
      center,
      circumferential,
      icon: this.db.circle({
        center: [center.x, center.y],
        r: ops.vdist(
          [center.x, center.y],
          [circumferential.x, circumferential.y]
        ),
        fillColor: [0, 0, 0, 0],
        strokeWidth: this.circleThickness,
        strokeColor: this.circleColor,
      }),
    };
  };

  /**
   * Construct a point, and ensure that it intersects with the given shapes.
   */
  getIntersection = (label: string, shape1: Shape, shape2: Shape): Point => {
    const point = this.mkPoint(label);

    const p = [point.x, point.y];
    const shapes = [shape1, shape2];
    for (const shape of shapes) {
      switch (shape.tag) {
        case "Circle": {
          const r = ops.vdist(
            [shape.center.x, shape.center.y],
            [shape.circumferential.x, shape.circumferential.y]
          );
          this.db.ensure(
            constraints.equal(ops.vdist(p, [shape.center.x, shape.center.y]), r)
          );
          break;
        }

        case "Line": {
          const p1 = [shape.point1.x, shape.point1.y];
          const p2 = [shape.point2.x, shape.point2.y];
          this.db.ensure(constraints.collinear(p1, p, p2));
          break;
        }

        case "Segment": {
          const p1 = [shape.point1.x, shape.point1.y];
          const p2 = [shape.point2.x, shape.point2.y];
          this.db.ensure(constraints.collinearOrdered(p1, p, p2));
          break;
        }
      }
    }

    return point;
  };

  ensureDistinct = (point1: Point, point2: Point) => {
    this.db.ensure(constraints.disjoint(point1.icon, point2.icon));
  };

  ensurePerpendicular = (s1: Segment, s2: Segment) => {
    // dot product the two normal vectors of the segments is zero
    const n1 = ops.vnormalize(
      ops.vsub([s1.point2.x, s1.point2.y], [s1.point1.x, s1.point1.y])
    );
    const n2 = ops.vnormalize(
      ops.vsub([s2.point2.x, s2.point2.y], [s2.point1.x, s2.point1.y])
    );
    this.db.ensure(constraints.equal(ops.vdot(n1, n2), 0));
  };

  ensureParallel = (s1: Segment, s2: Segment) => {
    // dot product the two normal vectors of the segments is zeor
    const n1 = ops.vnormalize(
      ops.vsub([s1.point2.x, s1.point2.y], [s1.point1.x, s1.point1.y])
    );
    const n2 = ops.vnormalize(
      ops.vsub([s2.point2.x, s2.point2.y], [s2.point1.x, s2.point1.y])
    );
    this.db.ensure(constraints.equal(ops.vdot(n1, n2), 1));
  };

  ensureEqualLength = (s1: Segment, s2: Segment) => {
    // dot product the two normal vectors of the segments
    this.db.ensure(
      constraints.equal(
        ops.vdist([s1.point2.x, s1.point2.y], [s1.point1.x, s1.point1.y]),
        ops.vdist([s2.point2.x, s2.point2.y], [s2.point1.x, s2.point1.y])
      )
    );
  };

  ensureX(p: Point, x: Num) {
    this.db.ensure(constraints.equal(p.x, x));
  }

  ensureY(p: Point, y: Num) {
    this.db.ensure(constraints.equal(p.y, y));
  }

  build = async () => {
    return this.db.build();
  };
}
