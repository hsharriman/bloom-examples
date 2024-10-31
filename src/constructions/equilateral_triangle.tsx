import { ConstructionDomain } from "./constructions.js";
import { Renderer, useDiagram } from "@penrose/bloom";

const buildDiagram = async () => {
  const cd = new ConstructionDomain(400, 400);

  const A = cd.mkPoint("A");
  const B = cd.mkPoint("B");

  const circ1 = cd.mkCircle(A, B);
  const circ2 = cd.mkCircle(B, A);

  const C = cd.getIntersection("C", circ1, circ2);

  const AB = cd.mkLine(A, B);
  const BC = cd.mkLine(B, C);
  const CA = cd.mkLine(C, A);

  return cd.build();
}

export default function EquilateralTriangleConstruction() {
  const diagram = useDiagram(buildDiagram);

  return (
    <div style={{
      width: "50em",
      height: "50em",
      border: "3px solid black",
    }}>
      <Renderer diagram={diagram} />
    </div>
  );
}