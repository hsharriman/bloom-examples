import {
  DiagramBuilder,
  canvas,
  Circle as BloomCircle,
  Line as BloomLine,
  ops,
  constraints, rayIntersectRect, Vec2,
} from "@penrose/bloom";
import { Num } from "@penrose/core";

export interface Point {
  tag: "Point";
  x: Num;
  y: Num;
  label: string;
  icon: BloomCircle;
}

export interface Segment {
  tag: "Segment";
  point1: Point;
  point2: Point;
  icon: BloomLine;
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
  private readonly pointRadius = 4;
  private readonly pointColor = [0, 0, 0, 1];
  private readonly lineThickness = 2;
  private readonly lineColor = [0, 0, 0, 1];
  private readonly circleThickness = 2;
  private readonly circleColor = [0, 0, 0, 1];

  private readonly width: number;
  private readonly height: number;
  private readonly db: DiagramBuilder;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.db = new DiagramBuilder(canvas(width, height), "");
  }

  mkPoint = (label: string, initPos?: [number, number]): Point => {
    const x = this.db.input({ init: initPos?.[0]});
    const y = this.db.input({ init: initPos?.[1]});
    return {
      tag: "Point",
      x,
      y,
      label,
      icon: this.db.circle({
        center: [x, y],
        r: this.pointRadius,
        fillColor: this.pointColor,
      })
    };
  }

  mkSegment = (point1: Point, point2: Point): Segment => {
    return {
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
  }

  mkLine = (point1: Point, point2: Point): Line => {
    const p1: Vec2 = [point1.x, point1.y];
    const p2: Vec2 = [point2.x, point2.y];

    const disp = ops.vsub(p2, p1) as Vec2;
    const canvasRect: Vec2[] = [
      [this.width / 2, this.height / 2],
      [-this.width / 2, this.height / 2],
      [-this.width / 2, -this.height / 2],
      [this.width /2, -this.height / 2]
    ];
    const start = rayIntersectRect(canvasRect, p1, disp);
    const end  = rayIntersectRect(canvasRect, p1, ops.vmul(-1, disp) as Vec2);

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
  }

  mkCircle = (center: Point, circumferential: Point): Circle => {
    return {
      tag: "Circle",
      center,
      circumferential,
      icon: this.db.circle({
        center: [center.x, center.y],
        r: ops.vdist([center.x, center.y], [circumferential.x, circumferential.y]),
        fillColor: [0, 0, 0, 0],
        strokeWidth: this.circleThickness,
        strokeColor: this.circleColor,
      })
    };
  }

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
          const r = ops.vdist([shape.center.x, shape.center.y], [shape.circumferential.x, shape.circumferential.y]);
          this.db.ensure(constraints.equal(ops.vdist(p, [shape.center.x, shape.center.y]), r));
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
  }

  ensureDistinct = (point1: Point, point2: Point) => {
    this.db.ensure(constraints.disjoint(point1.icon, point2.icon));
  }

  build = async () => {
    return this.db.build();
  }
}