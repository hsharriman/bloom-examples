import { Num } from "@penrose/core";
import {DiagramBuilder, Diagram, constraints, Vec2, ops, add, dot, canvas, Substance, Type, neg} from "@penrose/bloom";

export interface ShapeCommon {
  label?: string;
}
export interface Point extends ShapeCommon {
  tag: "Point";
  x?: number;
  y?: number;
}

export interface Segment extends ShapeCommon{
  tag: "Segment";
  point1: Point;
  point2: Point;
}

export interface Line extends ShapeCommon {
  tag: "Line",
  segment: Segment,
}

export interface Circle extends ShapeCommon {
  tag: "Circle",
  center: Point,
  circumferential: Point,
}

export type Shape = Point | Segment | Line | Circle;

const constraintPointsAreCircleIntersections = (
  p1: Vec2,
  p2: Vec2,
  [c1, cr1] : [Vec2, Vec2],
  [c2, cr2] : [Vec2, Vec2]
) : Num[] => {
  const r1 = ops.vdist(cr1, c1);
  const r2 = ops.vdist(cr2, c2);
  const mustOverlap = constraints.lessThan(ops.vdist(c1, c2), add(r1, r2));

  const p1IntersectsCirc1 = constraints.equal(ops.vdist(p1, c1), r1);
  const p2IntersectsCirc1 = constraints.equal(ops.vdist(p2, c1), r1);
  const p1IntersectsCirc2 = constraints.equal(ops.vdist(p1, c2), r2);
  const p2IntersectsCirc2 = constraints.equal(ops.vdist(p2, c2), r2);

  const c1c2Dir = ops.vnormalize(ops.vsub(c2, c1));
  const c1c2Norm = [neg(c1c2Dir[1]), c1c2Dir[0]];

  const p1Above = constraints.greaterThan(dot(ops.vsub(p1, c1), c1c2Norm), 0);
  const p2Below = constraints.lessThan(dot(ops.vsub(p2, c1), c1c2Norm), 0);

  return [
    mustOverlap,
    p1IntersectsCirc1,
    p2IntersectsCirc1,
    p1IntersectsCirc2,
    p2IntersectsCirc2,
    p1Above,
    p2Below,
  ];
}

export class Construction {
  shapes: Shape[] = [];
  constraints: [any, any[]][] = [];

  mkPoint = (x?: number, y?: number, label?: string) : Point => {
    return this.mkShape({ tag: "Point", x, y, label });
  }

  mkSegment = (point1: Point, point2: Point, label?: string) : Segment => {
    return this.mkShape({ tag: "Segment", point1, point2, label });
  }

  mkLine = (segment: Segment, label?: string) : Line => {
    return this.mkShape({ tag: "Line", segment, label });
  }

  mkCircle = (center: Point, circumferential: Point, label?: string) : Circle => {
    return this.mkShape({tag: "Circle", center, circumferential, label});
  }

  mkSegmentSegmentIntersection = (s1: Segment, s2: Segment) : Point => {
    const p = this.mkPoint();
    // this.constraints.push([constraints.overlapping, [s1, s2]]);
    this.constraints.push([constraints.collinearOrdered, [s1.point1, p, s1.point2]]);
    this.constraints.push([constraints.collinearOrdered, [s2.point1, p, s2.point2]]);
    return p;
  }

  mkCircleCircleIntersection = (c1: Circle, c2: Circle) : [Point, Point] => {
    const p1 = this.mkPoint();
    const p2 = this.mkPoint();
    this.constraints.push([
      constraintPointsAreCircleIntersections,
      [p1, p2, [c1.center, c1.circumferential], [c2.center, c2.circumferential]]
    ]);
    return [p1, p2];
  }

  build = () : Promise<Diagram> => {
    const db = new DiagramBuilder(canvas(400, 400));

    const Point = db.type();
    const Segment = db.type();
    const Line = db.type();
    const Circle = db.type();

    const tagToTypeMap = new Map<Shape["tag"], Type>([
      ["Point", Point],
      ["Segment", Segment],
      ["Line", Line],
      ["Circle", Circle],
    ]);

    const constructionToSubstanceMap = new Map<Shape, Substance>(
      this.shapes.map(shape => [shape, tagToTypeMap.get(shape.tag)!()])
    );

    for (const s of this.shapes) {
      const subst = constructionToSubstanceMap.get(s)!;
      switch (s.tag) {
        case "Point":
          subst.x = db.input({ init: s.x, optimized: s.x === undefined });
          subst.y = db.input({ init: s.y, optimized: s.y === undefined });
          subst.label = s.label;
          break;

        case "Segment":
          subst.point1 = constructionToSubstanceMap.get(s.point1)!;
          subst.point2 = constructionToSubstanceMap.get(s.point2)!;
          subst.label = s.label;
          break;

        case "Line":
          subst.segment = constructionToSubstanceMap.get(s.segment)!;
          subst.label = s.label;
          break;

        case "Circle":
          subst.center = constructionToSubstanceMap.get(s.center)!;
          subst.circumferential = constructionToSubstanceMap.get(s.circumferential)!;
          subst.label = s.label;
          break;
      }
    }

    db.forall({ p: Point }, ({ p }) => {
      p.shape = db.circle({
        center: [p.x, p.y],
        r: 5,
        fillColor: [0, 0, 0, 1],
        drag: true,
      })
    });

    db.forall({ s: Segment }, ({ s }) => {
      s.shape = db.line({
        start: [s.point1.x, s.point1.y],
        end: [s.point2.x, s.point2.y],
        strokeWidth: 2,
        strokeColor: [0, 0, 0, 1],
      })
    });

    db.forall({ l: Line }, ({ l }) => {
      l.shape = db.line({
        start: ops.vmul(100, [l.segment.point1.x, l.segment.point1.y]) as Vec2,
        end: ops.vmul(100, [l.segment.point2.x, l.segment.point2.y]) as Vec2,
        strokeWidth: 2,
        strokeColor: [0, 0, 0, 1],
        ensureOnCanvas: false,
      });
    });

    db.forall({ c: Circle }, ({ c }) => {
      c.shape = db.circle({
        center: [c.center.x, c.center.y],
        r: ops.vdist([c.center.x, c.center.y], [c.circumferential.x, c.circumferential.y]),
        fillColor: [0, 0, 0, 0],
        strokeWidth: 2,
        strokeColor: [0, 0, 0, 1],
      });
    });

    for (const [constraint, args] of this.constraints) {
      const argsCopy = [...args];
      const mapArgs = ((args: any[]) => {
        for (let i = 0; i < args.length; i++) {
          if (args[i].tag) {
            if (args[i].tag === "Point") {
              args[i] = constructionToSubstanceMap.get(args[i])!.shape.center;
            } else {
              args[i] = constructionToSubstanceMap.get(args[i])!.shape;
            }
          } else if (args[i] instanceof Array) {
            mapArgs(args[i]);
          }
        }
      })
      mapArgs(argsCopy);

      const newConstraints = constraint(...argsCopy);
      for (const newConstraint of newConstraints) {
        db.ensure(newConstraint);
      }
    }

    return db.build();
  }

  private mkShape = <T extends Shape>(s: T) => {
    this.shapes.push(s);
    return s;
  }
}