import { Num } from "@penrose/core";
import {
  DiagramBuilder,
  Diagram,
  constraints,
  ops,
  add,
  canvas,
  neg,
  Circle as BloomCircle,
  Equation as BloomEquation,
  Line as BloomLine,
  Vec2,
  dot,
  max,
  min, abs, sub,
} from "@penrose/bloom";

export interface ConstructionElementCommon {
  label?: BloomEquation;
}

export interface Point extends ConstructionElementCommon {
  tag: "Point";
  pos: Vec2;
  icon: BloomCircle;
  id: number;
}

export interface Segment extends ConstructionElementCommon {
  tag: "Segment";
  point1: Point;
  point2: Point;
  icon: BloomLine;
}

export interface Line extends ConstructionElementCommon {
  tag: "Line";
  point1: Point;
  point2: Point;
  icon: BloomLine;
}

export interface Circle extends ConstructionElementCommon {
  tag: "Circle";
  center: Point;
  circumferential: Point;
  icon: BloomCircle;
}

export type ConstructionElement = Point | Segment | Line | Circle;

const pointsAreCircleIntersections = (
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

export const canvasWidth = 400;
export const canvasHeight = 400;

const pointRad = 5;
const pointColor = [0, 0, 0, 1];

const lineLikeWidth = 2;
const lineLikeColor = [0, 0, 0, 1];

const circleWidth = 2;
const circleColor = [0, 0, 0, 1];

const labelDistMax = 15;
const labelDistMin = 5;

export class Construction {
  readonly db = new DiagramBuilder(canvas(canvasWidth, canvasHeight), "", 100);
  readonly elements : ConstructionElement[] = [];
  readonly labels : BloomEquation[] = [];

  private nextPointId = 0;

  mkPoint = (x?: number, y?: number, label?: string, draggable = false) : Point => {
    const id = this.nextPointId++;

    let cx: Num;
    if (x === undefined) {
      cx = this.db.input({ name: `${id}-x`});
    } else if (draggable) {
      cx = this.db.input({ name: `${id}-x`, init: x, optimized: false });
    } else {
      cx = x;
    }

    let cy: Num;
    if (y === undefined) {
      cy = this.db.input({ name: `${id}-y` });
    } else if (draggable) {
      cy = this.db.input({ name: `${id}-y`, init: y, optimized: false });
    } else {
      cy = y;
    }

    const icon = this.db.circle({
      r: pointRad,
      fillColor: pointColor,
      center: [cx, cy],
      drag: draggable,
    });

    let label_ = undefined;
    if (label !== undefined) {
      label_ = this.mkLabel(label);
      const toCenter = ops.vnorm(ops.vsub(label_.center, [cx, cy]));
      this.db.ensure(constraints.lessThan(labelDistMin, toCenter));
      this.db.ensure(constraints.lessThan(toCenter, labelDistMax));
    }

    const selectedIcon = this.db.circle({
      r: pointRad + 2,
      fillColor: [1, 0, 0, this.db.input({ init: 0, name: `selected-${id}`, optimized: false })],
      center: [cx, cy],
    });

    this.db.layer(selectedIcon, icon);

    const point: Point = {
      tag: "Point",
      pos: [cx, cy],
      icon,
      label: label_,
      id,
    };

    this.addElement(point);
    return point;
  }

  mkSegment = (point1: Point, point2: Point, label?: string) : Segment => {
    const icon = this.db.line({
      start: point1.pos,
      end: point2.pos,
      strokeWidth: lineLikeWidth,
      strokeColor: lineLikeColor,
    });

    let label_ = undefined;
    if (label !== undefined) {
      label_ = this.mkLabel(label);
      const segNorm = ops.vnormalize(ops.vsub(point2.pos, point1.pos));
      const segLength = ops.vdist(point1.pos, point2.pos);
      const t = max(0, min(segLength, dot(segNorm, ops.vsub(label_.center, point1.pos))));
      const proj = ops.vadd(point1.pos, ops.vmul(t, segNorm));
      const toProj = ops.vdist(proj, label_.center);
      this.db.ensure(constraints.lessThan(labelDistMin, toProj));
      this.db.ensure(constraints.equal(toProj, labelDistMax));
    }

    const selectedIcon = this.db.line({
      start: point1.pos,
      end: point2.pos,
      strokeWidth: lineLikeWidth + 2,
      strokeColor: [1, 0, 0, this.db.input({
        init: 0,
        name: `selected-${point1.id}-${point2.id}`,
        optimized: false
      })],
    });

    this.db.layer(selectedIcon, icon);

    const segment: Segment = {
      tag: "Segment",
      point1,
      point2,
      icon,
      label: label_,
    };

    this.addElement(segment);
    return segment;
  }

  mkLine = (point1: Point, point2: Point, label?: string) : Line => {
    const lineNorm = ops.vnormalize(ops.vsub(point2.pos, point1.pos));
    const midpoint = ops.vmul(0.5, ops.vadd(point1.pos, point2.pos));

    const icon = this.db.line({
      start: ops.vadd(midpoint, ops.vmul(1000, lineNorm)) as Vec2,
      end: ops.vadd(midpoint, ops.vmul(-1000, lineNorm)) as Vec2,
      strokeWidth: lineLikeWidth,
      strokeColor: lineLikeColor,
      ensureOnCanvas: false,
    });

    let label_ = undefined;
    if (label !== undefined) {
      label_ = this.mkLabel(label);
      const t = dot(lineNorm, ops.vsub(label_.center, point1.pos));
      const proj = ops.vadd(point1.pos, ops.vmul(t, lineNorm));
      const toProj = ops.vdist(proj, label_.center);
      this.db.ensure(constraints.lessThan(labelDistMin, toProj));
      this.db.ensure(constraints.lessThan(toProj, labelDistMax));
    }

    const selectedIcon = this.db.line({
      start: icon.start,
      end: icon.end,
      strokeWidth: lineLikeWidth + 2,
      strokeColor: [1, 0, 0, this.db.input({
        init: 0,
        name: `selected-${point1.id}<->${point2.id}`,
        optimized: false
      })],
      ensureOnCanvas: false,
    });
    this.db.layer(selectedIcon, icon);

    const line: Line = {
      tag: "Line",
      point1,
      point2,
      icon,
      label: label_,
    };

    this.addElement(line);
    return line;
  }

  mkCircle = (center: Point, circumferential: Point, label?: string) : Circle => {
    const icon = this.db.circle({
      center: center.pos,
      r: ops.vdist(center.pos, circumferential.pos),
      fillColor: [0, 0, 0, 0],
      strokeWidth: circleWidth,
      strokeColor: circleColor,
      ensureOnCanvas: false,
    });

    let label_ = undefined;
    if (label !== undefined) {
      label_ = this.mkLabel(label);
      const toCenter = ops.vnorm(ops.vsub(label_.center, center.pos));
      this.db.ensure(constraints.lessThan(add(icon.r, labelDistMin), toCenter));
      this.db.ensure(constraints.lessThan(toCenter, add(icon.r, labelDistMax)));
    }

    const circle: Circle = {
      tag: "Circle",
      center,
      circumferential,
      icon,
      label: label_,
    };

    const selectedIcon = this.db.circle({
      center: center.pos,
      r: add(icon.r, 2),
      fillColor: [0, 0, 0, 0],
      strokeWidth: circleWidth + 2,
      strokeColor: [1, 0, 0, this.db.input({
        init: 0,
        name: `selected-circ-${center.id}-${circumferential.id}`,
        optimized: false
      })],
      ensureOnCanvas: false,
    });

    this.db.layer(selectedIcon, icon);

    this.addElement(circle);
    return circle;
  }

  mkIntersections = (element1: ConstructionElement, element2: ConstructionElement) : Point[] => {
    switch (element1.tag) {
      case "Segment": {
        switch (element2.tag) {
          case "Segment": {
            return [this.mkSegmentSegmentIntersection(element1, element2)];
          }

          case "Line": {
            return [this.mkLineSegmentIntersection(element2, element1)];
          }

          default:
            throw new Error("Invalid intersection");
        }
      }

      case "Line": {
        switch (element2.tag) {
          case "Line": {
            return [this.mkLineLineIntersection(element1, element2)];
          }

          case "Segment": {
            return [this.mkLineSegmentIntersection(element1, element2)];
          }

          default:
            throw new Error("Invalid intersection");
        }
      }

      case "Circle": {
        switch (element2.tag) {
          case "Circle": {
            return this.mkCircleCircleIntersection(element1, element2);
          }

          default:
            throw new Error("Invalid intersection");
        }
      }

      default:
        throw new Error("Invalid intersection");
    }
  }

  setSelected = (element: ConstructionElement, active = true) : void => {
    let input;
    switch (element.tag) {
      case "Point": {
        input = this.db.getInput(`selected-${element.id}`);
        break;
      }

      case "Segment": {
        input = this.db.getInput(`selected-${element.point1.id}-${element.point2.id}`);
        break;
      }

      case "Line": {
        input = this.db.getInput(`selected-${element.point1.id}<->${element.point2.id}`);
        break;
      }

      case "Circle": {
        input = this.db.getInput(`selected-circ-${element.center.id}-${element.circumferential.id}`);
        break;
      }
    }

    input.val = active ? 1 : 0;
  };

  build = (currDiagram?: Diagram) : Promise<Diagram> => {
    if (currDiagram) {
      // match up point coordinates, if possible
      for (const el of this.elements) {
        if (el.tag === "Point") {
          try {
            const x = currDiagram.getInput(`${el.id}-x`);
            if (typeof el.pos[0] === "object" && el.pos[0].tag === "Var") {
              el.pos[0].val = x;
            }
          } catch { /* empty */ }

          try {
            const y = currDiagram.getInput(`${el.id}-y`);
            if (typeof el.pos[1] === "object" && el.pos[1].tag === "Var") {
              el.pos[1].val = y;
            }
          } catch { /* empty */ }
        }
      }
    }

    return this.db.build();
  }

  private mkLabel = (text: string) : BloomEquation => {
    const label = this.db.equation({
      string: text,
      fontSize: "10px",
    });
    for (const el of this.elements) {
      this.db.ensure(constraints.disjoint(el.icon, label));
    }
    this.labels.push(label);
    return label;
  }

  private addElement = (element: ConstructionElement) => {
    this.createLayering(element);
    this.updateLabelConstraints(element);
    this.elements.push(element);
  };

  private createLabelConstraint = (element: ConstructionElement, label: BloomEquation) => {
    switch (element.tag) {
      case "Point":
      case "Segment":
      case "Line": {
        this.db.ensure(constraints.disjoint(label, element.icon, labelDistMin));
        break;
      }

      case "Circle": {
        const distToCenter = ops.vdist(label.center, element.icon.center);
        const distToCircumference = abs(sub(element.icon.r, distToCenter));
        this.db.ensure(constraints.greaterThan(distToCircumference, labelDistMin));
        break;
      }
    }
  }

  private updateLabelConstraints = (element: ConstructionElement) => {
    if (element.label) {
      for (const other of this.elements) {
        this.createLabelConstraint(other, element.label);
      }
    }

    for (const label of this.labels) {
      this.createLabelConstraint(element, label);
    }
  }

  private createLayering = (element: ConstructionElement) => {
    // layer non-points below points to ensure selection works properly
    if (element.tag !== "Point") {
      for (const el of this.elements) {
        if (el.tag === "Point") {
          this.db.layer(element.icon, el.icon);
        }
      }
    }
  }

  private mkSegmentSegmentIntersection = (s1: Segment, s2: Segment) : Point => {
    const p = this.mkPoint();
    this.db.ensure(constraints.collinearOrdered(s1.point1.pos, p.pos, s1.point2.pos));
    this.db.ensure(constraints.collinearOrdered(s2.point1.pos, p.pos, s2.point2.pos));
    return p;
  }

  private mkLineLineIntersection = (l1: Line, l2: Line) : Point => {
    const p = this.mkPoint();
    this.db.ensure(constraints.collinear(l1.point1.pos, p.pos, l1.point2.pos));
    this.db.ensure(constraints.collinear(l2.point1.pos, p.pos, l2.point2.pos));
    return p;
  }

  private mkLineSegmentIntersection = (l: Line, s: Segment) : Point => {
    const p = this.mkPoint();
    this.db.ensure(constraints.collinear(l.point1.pos, p.pos, l.point2.pos));
    this.db.ensure(constraints.collinearOrdered(s.point1.pos, p.pos, s.point2.pos));
    return p;
  }

  private mkCircleCircleIntersection = (c1: Circle, c2: Circle) : [Point, Point] => {
    const p1 = this.mkPoint();
    const p2 = this.mkPoint();

    for (const constr of pointsAreCircleIntersections(
      p1.pos, p2.pos,
      [c1.center.pos, c1.circumferential.pos],
      [c2.center.pos, c2.circumferential.pos]
    )) {
      this.db.ensure(constr);
    }

    return [p1, p2];
  }
}

export type ConstructionAction =
  | "mkPoint"
  | "mkSegment"
  | "mkLine"
  | "mkCircle"
  | "mkIntersections";