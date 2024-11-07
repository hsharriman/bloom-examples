import { ConstructionDomain } from "./constructions.js";
import { Renderer, useDiagram } from "@penrose/bloom";

const buildDiagram = async () => {
  const cd = new ConstructionDomain(400, 400);

  const A = cd.mkPoint("A", true, true);
  const B = cd.mkPoint("B", true, true);
  const C = cd.mkPoint("C", true, true);
  const D = cd.mkPoint("D", true, true);
  const P = cd.mkPoint("P", true, true);
  const Q = cd.mkPoint("Q", true, true);
  const R = cd.mkPoint("R", true, true);
  const S = cd.mkPoint("S", true, true);

  const AS = cd.mkSegment(A, S, "a", true);
  const AP = cd.mkSegment(A, P, "b", true);
  const PS = cd.mkSegment(P, S, "c", true);
  cd.ensurePerpendicular(AS, AP);

  const BP = cd.mkSegment(P, B, "a", true);
  const BQ = cd.mkSegment(B, Q, "b", true);
  const PQ = cd.mkSegment(P, Q, "c", true);
  cd.ensureEqualLength(BP, AS);
  cd.ensureEqualLength(BQ, AP);
  cd.ensureEqualLength(PQ, PS);
  cd.ensurePerpendicular(BP, BQ);
  cd.ensureParallel(AP, BP);

  const CQ = cd.mkSegment(C, Q, "a", true);
  const CR = cd.mkSegment(C, R, "b", true);
  const RQ = cd.mkSegment(R, Q, "c", true);
  cd.ensureEqualLength(CQ, AS);
  cd.ensureEqualLength(CR, AP);
  cd.ensureEqualLength(RQ, PS);
  cd.ensurePerpendicular(CQ, CR);
  cd.ensureParallel(BQ, CQ);

  const DR = cd.mkSegment(D, R, "a", true);
  const DS = cd.mkSegment(D, S, "b", true);
  const RS = cd.mkSegment(R, S, "c", true);
  cd.ensureEqualLength(DR, AS);
  cd.ensureEqualLength(DS, AP);
  cd.ensureEqualLength(RS, PS);
  cd.ensurePerpendicular(DR, DS);
  cd.ensureParallel(CR, DR);
  cd.ensureParallel(DS, AS);

  cd.ensurePerpendicular(PQ, RQ);
  cd.ensurePerpendicular(RQ, RS);
  cd.ensurePerpendicular(RS, PS);
  cd.ensurePerpendicular(PS, RQ);
  return cd.build();
};

export default function PythagoreanConstructor() {
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
