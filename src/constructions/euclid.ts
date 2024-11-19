import { Color, constraints, objectives, ops } from "@penrose/bloom";
import { ConstructionDomain, Point, Segment, Triangle } from "./constructions";

export class EuclidConstruction extends ConstructionDomain {
  mkSegmentFixedLen = (p1: Point, p2: Point, length: number): Segment => {
    const s = this.mkSegment(p1, p2);
    this.db.ensure(
      constraints.equal(ops.vdist([p1.x, p1.y], [p2.x, p2.y]), length)
    );
    return s;
  };

  // Postulate 1
  lineBetweenPoints = (p1: Point, p2: Point): Segment => {
    return this.mkSegment(p1, p2);
  };

  // Postulate 2
  // p1, p2 should be from an existing segment
  extendLine = ([p1, p2]: [Point, Point], p3: Point): Segment => {
    const s2 = this.mkSegment(p2, p3);
    this.ensureCollinearOrdered(p1, p2, p3);
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
  moveSegment = (
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
}
