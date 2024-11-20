import { EuclidConstruction } from "../euclid";

export const BisectSegmentConstruction = async () => {
  const cd = new EuclidConstruction(400, 400);

  // Given
  const A = cd.mkPoint("A", true, true);
  const B = cd.mkPoint("B", true, true);
  const AB = cd.mkSegment(A, B);

  // Construction step 1
  const C = cd.mkPoint("C", true, true);
  const ABC = cd.equilateralTriangle(AB, C);

  // Construction step 2
  const D = cd.mkPoint("D", true, false);
  cd.ensureCollinearOrdered(A, D, B);
  cd.angleBisector(cd.mkAngle(C, A, B), D);

  return cd.build();
};
