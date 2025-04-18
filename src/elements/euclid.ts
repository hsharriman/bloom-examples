import {
  Equation as BloomEquation,
  Diagram,
  DiagramBuilder,
  Vec2,
  abs,
  add,
  canvas,
  constraints,
  dot,
  max,
  min,
  neg,
  objectives,
  ops,
  rayIntersectCircle,
  sub,
} from "@penrose/bloom";
import { Num } from "@penrose/core";
import {
  Circle,
  ConstructionElement,
  Line,
  MkPointProps,
  Point,
  Segment,
  Triangle,
} from "./types";

const MIN_CIRCLE_R = 70;
const MIN_SEGMENT_LENGTH = 30;

const pointsAreCircleIntersections = (
  p1: Vec2,
  p2: Vec2,
  [c1, cr1]: [Vec2, Vec2],
  [c2, cr2]: [Vec2, Vec2]
): Num[] => {
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
};

export const canvasWidth = 400;
export const canvasHeight = 400;

const pointRad = 5;
const pointColor = [0, 0, 0, 1];
const unfocusColor = [0, 0, 0, 0.5];

const lineLikeWidth = 2;
const lineLikeColor = [0, 0, 0, 1];

const circleWidth = 2;
const circleColor = [0, 0, 0, 1];

const labelDistMax = 15;
const labelDistMin = 5;

(letter: string) => {
  if (letter.toLowerCase() === "z") {
    return "A";
  }
  return String.fromCharCode(letter.charCodeAt(0) + 1);
};
export class Construction {
  readonly db; // <- TODO seed go here
  readonly elements: ConstructionElement[] = [];
  readonly labels: BloomEquation[] = [];

  private nextPointId = 0;
  private ptLabels: string[] = [];

  constructor(seed?: string) {
    this.db = new DiagramBuilder(canvas(canvasWidth, canvasHeight), seed, 1000);
  }

  mkPoint = (props: MkPointProps): Point => {
    const id = this.nextPointId++;
    const draggable = props.draggable === undefined || props.draggable;
    let cx: Num;
    if (props.x === undefined) {
      cx = this.db.input({ name: `${id}-x` });
    } else if (draggable) {
      cx = this.db.input({ name: `${id}-x`, init: props.x, optimized: false });
    } else {
      cx = props.x;
    }

    let cy: Num;
    if (props.y === undefined) {
      cy = this.db.input({ name: `${id}-y` });
    } else if (draggable) {
      cy = this.db.input({ name: `${id}-y`, init: props.y, optimized: false });
    } else {
      cy = props.y;
    }

    const icon = this.db.circle({
      r: pointRad,
      fillColor: pointColor,
      center: [cx, cy],
      drag: draggable,
    });

    let label = props.label;
    if (label) {
      if (new Set(this.ptLabels).has(label)) {
        console.error("Label already exists: ", props.label);
      } else {
        this.ptLabels.push(label);
      }
    } else {
      label = this.nextLetter(this.ptLabels[this.ptLabels.length - 1] || "A");
      this.ptLabels.push(label);
    }
    const label_ = this.mkLabel(label);
    const toCenter = ops.vnorm(ops.vsub(label_.center, [cx, cy]));
    this.db.encourage(constraints.equal(toCenter, labelDistMax));
    // this.db.encourage(constraints.lessThan(labelDistMin, toCenter));
    // this.db.encourage(constraints.lessThan(toCenter, labelDistMax));

    const selectedIcon = this.db.circle({
      r: pointRad + 2,
      fillColor: [
        1,
        0,
        0,
        this.db.input({ init: 0, name: `selected-${id}`, optimized: false }),
      ],
      center: [cx, cy],
    });

    this.db.layer(selectedIcon, icon);

    const point: Point = {
      tag: "Point",
      pos: [cx, cy],
      icon,
      // label: label_,
      id,
    };

    this.addElement(point);
    return point;
  };

  mkSegment = (
    point1: Point,
    point2: Point,
    label?: string,
    focus?: boolean
  ): Segment => {
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
      const t = max(
        0,
        min(segLength, dot(segNorm, ops.vsub(label_.center, point1.pos)))
      );
      const proj = ops.vadd(point1.pos, ops.vmul(t, segNorm));
      const toProj = ops.vdist(proj, label_.center);
      this.db.ensure(constraints.lessThan(labelDistMin, toProj));
      this.db.ensure(constraints.equal(toProj, labelDistMax));
    }

    const selectedIcon = this.db.line({
      start: point1.pos,
      end: point2.pos,
      strokeWidth: lineLikeWidth + 2,
      strokeColor: [
        1,
        0,
        0,
        this.db.input({
          init: 0,
          name: `selected-${point1.id}-${point2.id}`,
          optimized: false,
        }),
      ],
    });

    this.db.layer(selectedIcon, icon);

    const segment: Segment = {
      tag: "Segment",
      point1,
      point2,
      icon,
      label: label_,
    };

    this.db.encourage(
      constraints.greaterThan(
        ops.vdist(point1.pos, point2.pos),
        MIN_SEGMENT_LENGTH
      )
    );

    this.addElement(segment);
    return segment;
  };

  mkCircle = (
    center: Point,
    circumferential: Point,
    label?: string,
    focus?: boolean
  ): Circle => {
    this.db.ensure(
      constraints.greaterThan(
        ops.vdist(center.pos, circumferential.pos),
        MIN_CIRCLE_R
      )
    );
    const icon = this.db.circle({
      center: center.pos,
      r: ops.vdist(center.pos, circumferential.pos),
      fillColor: [0, 0, 0, 0],
      strokeWidth: circleWidth,
      strokeColor: focus ? circleColor : unfocusColor,
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
      strokeColor: [
        1,
        0,
        0,
        this.db.input({
          init: 0,
          name: `selected-circ-${center.id}-${circumferential.id}`,
          optimized: false,
        }),
      ],
      ensureOnCanvas: false,
    });

    this.db.layer(selectedIcon, icon);

    this.addElement(circle);
    return circle;
  };

  mkIntersections = (
    element1: ConstructionElement,
    element2: ConstructionElement,
    focus?: boolean
  ): Point[] => {
    focus = focus !== undefined && focus;
    switch (element1.tag) {
      case "Segment": {
        switch (element2.tag) {
          case "Segment": {
            return [
              this.mkSegmentSegmentIntersection(element1, element2, focus),
            ];
          }

          case "Line": {
            return [this.mkLineSegmentIntersection(element2, element1, focus)];
          }

          default:
            throw new Error("Invalid intersection");
        }
      }

      case "Line": {
        switch (element2.tag) {
          case "Line": {
            return [this.mkLineLineIntersection(element1, element2, focus)];
          }

          case "Segment": {
            return [this.mkLineSegmentIntersection(element1, element2, focus)];
          }

          default:
            throw new Error("Invalid intersection");
        }
      }

      case "Circle": {
        switch (element2.tag) {
          case "Circle": {
            return this.mkCircleCircleIntersection(element1, element2, focus);
          }
          case "Segment": {
            return [
              this.mkCircleSegmentIntersection(element2, element1, focus),
            ];
          }
          default:
            throw new Error("Invalid intersection");
        }
      }

      default:
        throw new Error("Invalid intersection");
    }
  };

  mkTriangle = (p1: Point, p2: Point, p3: Point, focus?: boolean): Triangle => {
    const t: Triangle = {
      tag: "Triangle",
      p1p2: this.getOrCreateSegment(p1, p2),
      p2p3: this.getOrCreateSegment(p2, p3),
      p1p3: this.getOrCreateSegment(p1, p3),
      p1,
      p2,
      p3,
      icon: this.db.polygon({
        points: [p1.pos, p2.pos, p3.pos],
        strokeWidth: lineLikeWidth,
        fillColor: [0, 0, 0, 0],
        strokeColor: focus ? lineLikeColor : unfocusColor,
      }),
    };
    return t;
  };

  mkTriangleFromSegments = (
    s1: Segment,
    s2: Segment,
    s3: Segment,
    focus?: boolean
  ): Triangle => {
    const p1 = this.mkPoint({ focus });
    const p2 = this.mkPoint({ focus });
    const p3 = this.mkPoint({ focus });
    const t: Triangle = {
      tag: "Triangle",
      p1p2: this.mkSegment(p1, p2),
      p2p3: this.mkSegment(p2, p3),
      p1p3: this.mkSegment(p1, p3),
      p1,
      p2,
      p3,
      icon: this.db.polygon({
        points: [p1.pos, p2.pos, p3.pos],
        strokeColor: focus ? lineLikeColor : unfocusColor,
        strokeWidth: lineLikeWidth,
      }),
    };

    this.ensureEqualLength(s1, t.p1p2);
    this.ensureEqualLength(s2, t.p2p3);
    this.ensureEqualLength(s3, t.p1p3);

    return t;
  };

  mkEquilateralTriangle = (
    p1: Point,
    p2: Point,
    focus?: boolean,
    sideLength: number = 50
  ): [Triangle, Point, Segment, Segment, Segment] => {
    // make a triangle based on the side length of p1 -> p2
    const p3 = this.mkPoint({ focus });
    const t = this.mkTriangle(p1, p2, p3);
    this.ensureEqualLength(t.p1p2, t.p2p3);
    this.ensureEqualLength(t.p1p2, t.p1p3);

    // encourage triangle to be non-degenerate
    this.db.encourage(
      objectives.greaterThan(ops.vdist(t.p1.pos, t.p2.pos), sideLength)
    );
    return [t, p3, t.p1p2, t.p2p3, t.p1p3];
  };

  mkLineExtension = (
    [p1, p2]: [Point, Point],
    focus?: boolean
  ): [Segment, Point] => {
    // extend a line in the direction of p1 -> p2
    const p3 = this.mkPoint({
      focus,
    });
    const s2 = this.mkSegment(p2, p3, undefined, focus);
    this.db.ensure(constraints.collinearOrdered(p1.pos, p2.pos, p3.pos));
    const minLen = 100;
    this.db.encourage(
      objectives.greaterThan(ops.vdist(p2.pos, p3.pos), minLen)
    );
    return [s2, p3];
  };

  mkLinesParallel = (s1: Segment, s2: Segment): Segment[] => {
    const v1 = ops.vsub(s1.point2.pos, s1.point1.pos);
    const v2 = ops.vsub(s2.point2.pos, s2.point1.pos);
    this.db.ensure(objectives.equal(ops.vdot(v1, v2), 0));
    return [];
  };

  mkParallelLine = (s1: Segment, p: Point): [Segment, Point] => {
    const p2 = this.mkPoint({});
    const s2 = this.mkSegment(p, p2);
    const v1 = ops.vsub(s1.point2.pos, s1.point1.pos);
    const v2 = ops.vsub(s2.point2.pos, s2.point1.pos);
    this.db.ensure(objectives.equal(ops.vdot(v1, v2), 0));
    return [s2, p2];
  };

  mkParallelLineBwPoints = (s1: Segment, p: Point, newPt: Point): [Segment] => {
    const p2 = this.getOrCreatePoint(newPt);
    const s2 = this.mkSegment(p, p2);
    const v1 = ops.vsub(s1.point2.pos, s1.point1.pos);
    const v2 = ops.vsub(s2.point2.pos, s2.point1.pos);
    this.db.ensure(objectives.equal(ops.cross2(v1, v2), 0));
    return [s2];
  };

  mkEqualSegment = (s: Segment, p1: Point, p2: Point): Segment => {
    // enforce that 2 segments are the same length
    const seg = this.mkSegment(p1, p2);
    this.ensureEqualLength(s, seg);
    return seg;
  };

  mkCopySegment = (s: Segment, p: Point): [Segment, Point] => {
    // Copy a segment to a point
    const p2 = this.mkPoint({});
    const s2 = this.mkSegment(p, p2);
    this.ensureEqualLength(s, s2);
    return [s2, p2];
  };

  mkCopyAngle = (
    p1: Point,
    corner: Point,
    p2: Point,
    newCorner: Point
  ): [Segment, Segment] => {
    // Copy an angle to a new pt
    const np1 = this.mkPoint({});
    const np3 = this.mkPoint({});
    const s2 = this.mkSegment(np1, newCorner);
    const s3 = this.mkSegment(np3, newCorner);
    this.db.ensure(
      constraints.equal(
        ops.vdist(p1.pos, corner.pos),
        ops.vdist(np1.pos, newCorner.pos)
      )
    );
    this.db.ensure(
      constraints.equal(
        ops.vdist(p2.pos, corner.pos),
        ops.vdist(np3.pos, newCorner.pos)
      )
    );
    return [s2, s3];
  };

  mkCopySegmentToSegment = (s: Segment, p1: Point, p2: Point): [Point] => {
    // Copy a segment to a point on segment s2
    const p3 = this.mkPoint({});
    this.db.ensure(constraints.collinearOrdered(p1.pos, p3.pos, p2.pos));
    this.db.ensure(
      constraints.equal(
        ops.vdist(p1.pos, p3.pos),
        ops.vdist(s.point1.pos, s.point2.pos)
      )
    );
    return [p3];
  };

  mkBisectAngle = (p1: Point, corner: Point, p2: Point): [Segment, Point] => {
    // Cut an angle in half
    const p3 = this.mkPoint({});
    const bisector = this.mkSegment(corner, p3);
    const a = ops.vsub(p1.pos, corner.pos);
    const b = ops.vsub(p3.pos, corner.pos);
    const c = ops.vsub(p2.pos, corner.pos);
    this.db.ensure(constraints.equal(ops.vdot(a, b), ops.vdot(b, c)));
    return [bisector, p3];
  };

  mkBisectSegment = (p1: Point, p2: Point): [Point] => {
    const p3 = this.mkPoint({});
    // cut a segment in half
    this.db.ensure(constraints.collinearOrdered(p1.pos, p3.pos, p2.pos));
    this.db.ensure(
      constraints.equal(ops.vdist(p1.pos, p3.pos), ops.vdist(p3.pos, p2.pos))
    );
    return [p3];
  };

  mkPerpendicularLine = (s: Segment, p: Point): [Segment, Point] => {
    // make a line perpendicular to a segment
    const p2 = this.mkPoint({});
    const s2 = this.mkSegment(p, p2);
    this.db.ensure(
      constraints.equal(
        ops.vdot(ops.vsub(s.point2.pos, s.point1.pos), ops.vsub(p.pos, p2.pos)),
        0
      )
    );
    return [s2, p2];
  };

  mkCutGivenLen = (
    p1: Point,
    p2: Point,
    focus?: boolean,
    len: number = 100
  ): [Point, Segment] => {
    const p3 = this.mkPoint({ focus });
    const s2 = this.mkSegment(p1, p3, undefined, focus);

    this.db.ensure(constraints.equal(ops.vnorm(ops.vsub(p1.pos, p2.pos)), len));
    this.db.ensure(constraints.collinearOrdered(p1.pos, p3.pos, p2.pos));
    return [p3, s2];
  };

  mkCollinear = (s: Segment, p: Point): Point[] => {
    this.db.ensure(
      constraints.collinearOrdered(s.point1.pos, p.pos, s.point2.pos)
    );
    return [];
  };

  mkHorizontalSegment = (p1: Point, p2: Point): Segment => {
    const s = this.mkSegment(p1, p2);
    this.db.ensure(constraints.equal(p1.pos[1], p2.pos[1]));
    return s;
  };

  setSelected = (element: ConstructionElement, active = true): void => {
    let input;
    switch (element.tag) {
      case "Point": {
        input = this.db.getInput(`selected-${element.id}`);
        break;
      }

      case "Segment": {
        input = this.db.getInput(
          `selected-${element.point1.id}-${element.point2.id}`
        );
        break;
      }

      case "Line": {
        input = this.db.getInput(
          `selected-${element.point1.id}<->${element.point2.id}`
        );
        break;
      }

      case "Circle": {
        input = this.db.getInput(
          `selected-circ-${element.center.id}-${element.circumferential.id}`
        );
        break;
      }

      case "Triangle": {
        // TODO how is this selection ID created?
        input = this.db.getInput(`selected-triangle-${element.p1.id}`);
        break;
      }
    }

    input.val = active ? 1 : 0;
  };

  build = (currDiagram?: Diagram, freeze = false): Promise<Diagram> => {
    if (currDiagram) {
      // match up point coordinates, if possible
      for (const el of this.elements) {
        if (el.tag === "Point") {
          try {
            const x = currDiagram.getInput(`${el.id}-x`);
            if (typeof el.pos[0] === "object" && el.pos[0].tag === "Var") {
              el.pos[0].val = x;
            }
          } catch {
            /* empty */
          }

          try {
            const y = currDiagram.getInput(`${el.id}-y`);
            if (typeof el.pos[1] === "object" && el.pos[1].tag === "Var") {
              el.pos[1].val = y;
            }
          } catch {
            /* empty */
          }
        }
      }
    }

    for (const el of this.elements) {
      if (el.tag == "Point") {
        this.db.setOptimized(`${el.id}-x`, !freeze);
        this.db.setOptimized(`${el.id}-y`, !freeze);
      }
    }

    return this.db.build();
  };

  private mkLabel = (text: string): BloomEquation => {
    const label = this.db.equation({
      string: text,
      fontSize: "10px",
    });
    for (const el of this.elements) {
      this.db.ensure(constraints.disjoint(el.icon, label));
    }
    this.labels.push(label);
    return label;
  };

  private addElement = (element: ConstructionElement) => {
    this.createLayering(element);
    this.updateLabelConstraints(element);
    this.elements.push(element);
  };

  private createLabelConstraint = (
    element: ConstructionElement,
    label: BloomEquation
  ) => {
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
        this.db.ensure(
          constraints.greaterThan(distToCircumference, labelDistMin)
        );
        break;
      }
    }
  };

  private updateLabelConstraints = (element: ConstructionElement) => {
    if (element.label) {
      for (const other of this.elements) {
        this.createLabelConstraint(other, element.label);
      }
    }

    for (const label of this.labels) {
      this.createLabelConstraint(element, label);
    }
  };

  private createLayering = (element: ConstructionElement) => {
    // layer non-points below points to ensure selection works properly
    if (element.tag !== "Point") {
      for (const el of this.elements) {
        if (el.tag === "Point") {
          this.db.layer(element.icon, el.icon);
        }
      }
    }
  };

  private mkSegmentSegmentIntersection = (
    s1: Segment,
    s2: Segment,
    focus: boolean
  ): Point => {
    const p = this.mkPoint({ focus });
    this.db.ensure(
      constraints.collinearOrdered(s1.point1.pos, p.pos, s1.point2.pos)
    );
    this.db.ensure(
      constraints.collinearOrdered(s2.point1.pos, p.pos, s2.point2.pos)
    );
    return p;
  };

  private mkLineLineIntersection = (
    l1: Line,
    l2: Line,
    focus: boolean
  ): Point => {
    const p = this.mkPoint({ focus });
    this.db.ensure(constraints.collinear(l1.point1.pos, p.pos, l1.point2.pos));
    this.db.ensure(constraints.collinear(l2.point1.pos, p.pos, l2.point2.pos));
    return p;
  };

  private mkLineSegmentIntersection = (
    l: Line,
    s: Segment,
    focus: boolean
  ): Point => {
    const p = this.mkPoint({ focus });
    this.db.ensure(constraints.collinear(l.point1.pos, p.pos, l.point2.pos));
    this.db.ensure(
      constraints.collinearOrdered(s.point1.pos, p.pos, s.point2.pos)
    );
    return p;
  };

  private mkCircleCircleIntersection = (
    c1: Circle,
    c2: Circle,
    focus: boolean
  ): [Point, Point] => {
    const p1 = this.mkPoint({ focus });
    const p2 = this.mkPoint({ focus });

    for (const constr of pointsAreCircleIntersections(
      p1.pos,
      p2.pos,
      [c1.center.pos, c1.circumferential.pos],
      [c2.center.pos, c2.circumferential.pos]
    )) {
      this.db.ensure(constr);
    }

    return [p1, p2];
  };

  private mkCircleSegmentIntersection = (
    s: Segment,
    c: Circle,
    focus: boolean
  ): Point => {
    const p = this.mkPoint({ focus });

    const constr = rayIntersectCircle(
      c.center.pos,
      ops.vdist(c.center.pos, c.circumferential.pos),
      s.point1.pos,
      s.point2.pos
    );
    this.db.ensure(constraints.equal(ops.vdist(p.pos, constr), 0));
    this.db.ensure(
      constraints.collinearOrdered(s.point1.pos, p.pos, s.point2.pos)
    );
    return p;
  };

  private ensureEqualLength = (s1: Segment, s2: Segment) => {
    // dot product the two normal vectors of the segments
    this.db.ensure(
      constraints.equal(
        ops.vdist(s1.point2.pos, s1.point1.pos),
        ops.vdist(s2.point2.pos, s2.point1.pos)
      )
    );
  };

  private nextLetter = (letter: string) => {
    if (letter.toUpperCase() === "Z") {
      return "A";
    }
    return String.fromCharCode(letter.toUpperCase().charCodeAt(0) + 1);
  };

  private getOrCreateSegment = (p1: Point, p2: Point): Segment => {
    const segs: Segment[] = this.elements.filter(
      (el) => el.tag === "Segment"
    ) as Segment[];
    return (
      segs.find((s) => s.point1 === p1 && s.point2 === p2) ||
      this.mkSegment(p1, p2)
    );
  };

  private getOrCreatePoint = (p1: Point): Point => {
    const pts: Point[] = this.elements.filter(
      (el) => el.tag === "Point"
    ) as Point[];
    return pts.find((p) => p === p1) || this.mkPoint({});
  };
}
