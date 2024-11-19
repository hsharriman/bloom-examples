import { EuclidConstruction } from "../euclid.js";

export const CutLengthConstruction = async () => {
  const cd = new EuclidConstruction(400, 400);

  // Given
  const A = cd.mkPoint("A", true, true);
  const B = cd.mkPoint("B", true, true);
  const C = cd.mkPoint("C", true, true);
  const G = cd.mkPoint("G", false, true);
  const AB = cd.mkSegment(A, B);
  const CE = cd.mkSegmentFixedLen(C, G, 100);

  // Construction step 1
  const D = cd.mkPoint("D", true, true);
  const AD = cd.mkSegment(A, D);
  cd.ensureEqualLength(AD, CE);

  // Construction step 2
  const F = cd.mkCircle(A, D);
  const E = cd.getIntersection("E", F, AB, true);
  return cd.build();
};
