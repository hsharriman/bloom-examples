import { Color, constraints, objectives, ops } from "@penrose/bloom";
import {
  Angle,
  ConstructionDomain,
  Point,
  Segment,
  Triangle,
} from "./constructions";

// TODO trying to figure out whether to stick with Euclid's elements or go more generic
export class EuclidConstruction extends ConstructionDomain {
  mkSegmentFixedLen = (p1: Point, p2: Point, length: number): Segment => {
    const s = this.mkSegment(p1, p2);
    this.db.ensure(
      constraints.equal(ops.vdist([p1.x, p1.y], [p2.x, p2.y]), length)
    );
    return s;
  };

  // Postulate 2
  // p1, p2 should be from an existing segment
  extendLine = ([p1, p2]: [Point, Point], p3: Point): Segment => {
    const s2 = this.mkSegment(p2, p3);
    this.ensureCollinearOrdered(p1, p2, p3);
    const minLen = 100;
    this.db.encourage(
      objectives.greaterThan(ops.vdist([p2.x, p2.y], [p3.x, p3.y]), minLen)
    );
    return s2;
  };

  // Proposition 1
  equilateralTriangle = (
    s: Segment,
    p: Point,
    color: Color = [0, 0, 0, 0],
    sideLength: number = 50
  ): Triangle => {
    const t = this.mkTriangle(s.point1, s.point2, p, color);
    this.ensureEqualLength(t.p1p2, t.p2p3);
    this.ensureEqualLength(t.p1p2, t.p1p3);

    // encourage triangle to be non-degenerate
    const [p1, p2] = [t.point1, t.point2];
    this.db.encourage(
      objectives.greaterThan(ops.vdist([p1.x, p1.y], [p2.x, p2.y]), sideLength)
    );
    return t;
  };

  // Proposition 2
  // TODO not used
  copySegment = (
    s: Segment,
    p: Point,
    pLabel: string,
    labeled?: boolean,
    draggable?: boolean
  ): Segment => {
    const p2 = this.mkPoint(pLabel, labeled, draggable);
    const s2 = this.mkSegment(p, p2);
    this.ensureEqualLength(s, s2);
    return s2;
  };

  // Proposition 3
  // creates segment p1->p2 of given length along p1 -> p3.
  cutGivenLength = (p1: Point, p2: Point, p3: Point, length: number) => {
    const s = this.mkSegmentFixedLen(p1, p2, length);
    this.ensureCollinearOrdered(p1, p2, p3);
    return s;
  };

  // Cut an angle in half between a.vertex and p
  angleBisector = (a: Angle, p: Point): Segment => {
    const a1 = this.mkAngle(a.vertex, a.start, p);
    const a2 = this.mkAngle(a.vertex, a.end, p);
    this.ensureEqualAngle(a1, a2);
    return this.mkSegment(a.vertex, p);
  };
}
