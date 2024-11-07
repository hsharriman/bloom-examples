import { ConstructionDomain } from "./constructions.js";
import { Renderer, useDiagram } from "@penrose/bloom";

const buildDiagram = async () => {
  const cd = new ConstructionDomain(400, 400);

  const A = cd.mkPoint("A", true, true);
  const B = cd.mkPoint("B", true, true);
  const C = cd.mkPoint("C", true, true);

  const AB = cd.mkSegment(A, B);
  const BC = cd.mkSegment(B, C);
  cd.ensureParallel(AB,BC);


  const D = cd.mkPoint("D", true, true);
  const E= cd.mkPoint("E", true, true);
  const F = cd.mkPoint("F", true, true);
  const G = cd.mkPoint("G", true, true);

  const DE = cd.mkSegment(D, E);
  const FG = cd.mkSegment(F, G);
  cd.ensurePerpendicular(DE,FG);
  return cd.build();
};

export default function ParallelLinesConstructor() {
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
