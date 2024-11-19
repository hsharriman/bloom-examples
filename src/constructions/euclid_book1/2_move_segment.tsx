import { EuclidConstruction } from "../euclid.js";

export const MoveSegmentConstruction = async () => {
  const cd = new EuclidConstruction(400, 400);

  // Given
  const A = cd.mkPoint("A", true, true);
  const B = cd.mkPoint("B", true, true);
  const C = cd.mkPoint("C", true, true);
  const CB = cd.mkSegment(C, B);

  // Construction step 1
  const AB = cd.mkSegment(A, B);
  const D = cd.mkPoint("D", true, true);
  const ABD = cd.equilateralTriangle(AB, D);

  // Construction step 2
  // TODO make clearer what side/segment is being used from triangle
  const F = cd.mkPoint("F", true, true);
  const FB = cd.extendLine([ABD.point3, ABD.point2], F);

  const E = cd.mkPoint("E", true, true);
  const AE = cd.extendLine([ABD.point3, ABD.point1], E);

  // Construction step 4
  const H = cd.mkCircle(B, C);
  const G = cd.getIntersection("G", H, FB);

  // Construction step 5
  const K = cd.mkCircle(D, G);

  return cd.build();
};
