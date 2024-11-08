import {
  DiagramBuilder,
  canvas,
  Circle as BloomCircle,
  Line as BloomLine,
  Equation as BloomEquation,
  Polygon as BloomPolygon,
  Color,
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

export interface Triangle {
  tag: "Triangle";
  icon: BloomPolygon;
}

export type Shape = Point | Segment | Line | Circle;

export class ConstructionDomain {
  private readonly pointRadius = 2;
  private readonly pointColor = [0, 0, 0, 1];
  private readonly lineThickness = 2;
  private readonly lineColor = [0, 0, 0, 1];
  private readonly circleThickness = 4;
  private readonly circleColor = [0, 0, 0, 1];

  private readonly width: number;
  private readonly height: number;
  public readonly db: DiagramBuilder;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.db = new DiagramBuilder(canvas(width, height), "abcd", 1);
  }

  mkPointFixed = (label: string, x: Num, y: Num, labeled:boolean = false): Point => {
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
    if(labeled) {
      p.text = this.db.equation({
        center: [x2, y2],
        string: label,
        fontSize: "8px"
      });
      this.db.ensure(constraints.equal(ops.vdist([x, y], [x2, y2]), 8));
    }
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
    const x2 = this.db.input();
    const y2 = this.db.input();
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

  mkTriangle = (p1: Point, p2: Point, p3: Point, c : Color): Triangle => {
    return {
      tag: "Triangle",
      icon: this.db.polygon({
        points: [
          [p1.x, p1.y],
          [p2.x, p2.y],
          [p3.x, p3.y],
        ],
        fillColor: c,
        strokeWidth: this.lineThickness,
      }),
    };
  };

  private perp_point(p1: Point, p2: Point, d: Num): Num[] {
    // this doesn't work for some reason: JSS
    // Calculate the midpoint of the line segment
    const midpoint = ops.vdiv(ops.vadd([p1.x, p1.y], [p2.x, p2.y]), 2);

    const vec = ops.vsub([p2.x, p2.y], [p1.x, p1.y]);
    const perp_vec = ops.rot90(ops.vnormalize(vec));
    const new_point : Num[] = ops.vadd(midpoint, ops.vmul(d, perp_vec));
    return new_point;
  }

  mkSegment = (
    point1: Point,
    point2: Point,
    label?: string,
    labeled: boolean = false
  ): Segment => {
    // const label_x = this.db.input();
    // const label_y = this.db.input();
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
      const label_loc = this.perp_point(point1, point2, 5) as Vec2;
      s.text = this.db.equation({
        center: label_loc,
        string: label,
        fontSize: "8px"
      });
    }
    // const midpoint_x = div(add(point1.x, point2.x),2);
    // const midpoint_y = div(add(point1.y, point2.y),2);
    // this.db.ensure(constraints.equal(ops.vdist([midpoint_x, midpoint_y], [label_x, label_y]), 8));
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

  ensureDisjoint = (t: Triangle, segments : Segment[]) => {
    // dot product the two normal vectors of the segments
    for(const s of segments) {
      if(s.text) {
        this.db.ensure(constraints.disjoint(t.icon, s.text));
      }
    }
  };

  ensureX(p: Point, x_fixed: Num) {
    this.db.ensure(constraints.equal(p.x, x_fixed));
    p.icon.dragConstraint = ([x, y]: [number, number]): [number, number] => {
      return [x_fixed as number, y];
    }
  }

  ensureY(p: Point, y_fixed: Num) {
    this.db.ensure(constraints.equal(p.y, y_fixed));
    p.icon.dragConstraint = ([x, y]: [number, number]): [number, number] => {
      return [x, y_fixed as number];
    }
  }

  build = async () => {
    return this.db.build();
  };
}
