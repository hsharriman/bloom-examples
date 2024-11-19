import { EuclidConstruction } from "../euclid";

export const IsoscelesConstruction = async () => {
  const cd = new EuclidConstruction(400, 400);

  // Given
  const A = cd.mkPoint("A", true, true);
  const B = cd.mkPoint("B", true, true);
  const C = cd.mkPoint("C", true, true);
  // coloring in bloom?
  const ABC = cd.mkTriangle(A, B, C, [0, 0, 0, 0]);
  cd.ensureEqualLength(ABC.p1p2, ABC.p1p3);

  // Construction step 1
  const D = cd.mkPoint("D", true, true);
  const AD = cd.extendLine([ABC.point1, ABC.point2], D);

  const E = cd.mkPoint("E", true, true);
  const AE = cd.extendLine([ABC.point1, ABC.point3], E);

  // Construction step 2
  const F = cd.mkPoint("F", true, false);
  const G = cd.mkPoint("G", true, false);
  const cutLength = 70;
  cd.cutGivenLength(B, F, D, cutLength);
  cd.cutGivenLength(C, G, E, cutLength);

  // Construction step 3
  // make segments BG and CF
  cd.mkSegment(B, G);
  cd.mkSegment(C, F);
  return cd.build();
};
