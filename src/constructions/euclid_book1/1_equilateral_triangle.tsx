import { ConstructionDomain } from "../constructions.js";

export const EquilateralTriangleConstruction = async () => {
  const cd = new ConstructionDomain(400, 400);

  // Given
  const A = cd.mkPoint("A", true, true);
  const B = cd.mkPoint("B", true, true);
  const AB = cd.mkLine(A, B);

  // Construction step 1
  const circ1 = cd.mkCircle(A, B);
  const circ2 = cd.mkCircle(B, A);

  // Construction step 2
  const C = cd.getIntersection("C", circ1, circ2);

  // Highlight triangle
  const ABC = cd.mkTriangle(A, B, C, [0, 0.4, 1, 0.5]);

  // Construction step 3
  const BC = cd.mkLine(B, C);
  const CA = cd.mkLine(C, A);

  return cd.build();
};
