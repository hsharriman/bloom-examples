import { objectives } from "@penrose/bloom";
import { EuclidConstruction } from "../euclid";

export const BisectAngleConstruction = async () => {
  const cd = new EuclidConstruction(400, 400);

  // Given
  const A = cd.mkPoint("A", true, true);
  const B = cd.mkPoint("B", true, true);
  const C = cd.mkPoint("C", true, true);
  const AB = cd.mkSegment(A, B);
  const AC = cd.mkSegment(A, C);
  cd.db.encourage(objectives.nonDegenerateAngle(B.icon, A.icon, C.icon, 1, 3));

  // Construction step 1
  const D = cd.mkPoint("D", true, false);
  const E = cd.mkPoint("E", true, false);
  const cutLength = 70;
  cd.cutGivenLength(A, D, B, cutLength);
  cd.cutGivenLength(A, E, C, cutLength);

  // Construction step 2
  const F = cd.mkPoint("F", true, true);
  const DE = cd.mkSegment(D, E);
  const AFE = cd.equilateralTriangle(DE, F);
  const FA = cd.mkSegment(F, A);

  return cd.build();
};
