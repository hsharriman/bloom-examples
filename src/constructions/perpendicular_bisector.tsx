import { Renderer, useDiagram } from "@penrose/bloom";
import { ConstructionDomain } from "./constructions.js";

const buildDiagram = async () => {
  const cd = new ConstructionDomain(400, 400);

  const A = cd.mkPoint("A");
  const B = cd.mkPoint("B");
  cd.mkSegment(A, B);

  const circ1 = cd.mkCircle(A, B);
  const circ2 = cd.mkCircle(B, A);

  const C = cd.getIntersection("C", circ1, circ2);
  const D = cd.getIntersection("D", circ1, circ2);
  cd.ensureDistinct(C, D);

  cd.mkLine(C, D);

  return cd.build();
};

export default function PerpendicularBisectorConstructor() {
  const diagram = useDiagram(buildDiagram);

  return (
    <div
      style={{
        width: "50em",
        height: "50em",
        border: "3px solid black",
      }}
    >
      <Renderer diagram={diagram} />
    </div>
  );
}
