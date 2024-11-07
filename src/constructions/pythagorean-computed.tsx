import { ConstructionDomain } from "./constructions.js";
import { Renderer, useDiagram, ops, add, sub } from "@penrose/bloom";

const buildDiagram = async () => {
  const cd = new ConstructionDomain(400, 400);

  const X = cd.mkPoint("X", true, true);
  const Y = cd.mkPoint("Y", true, true);
  const Z = cd.mkPoint("Z", true, true);
  const XY = cd.mkSegment(X, Y, "a", true);
  const a = ops.vdist([X.x, X.y],[Y.x, Y.y])
  const YZ = cd.mkSegment(Y, Z, "b", true);
  const b = ops.vdist([Z.x, Z.y],[Y.x, Y.y])
  cd.mkSegment(X, Z, "c", true);
  cd.ensurePerpendicular(XY, YZ);

  const A = cd.mkPoint("A", true, true);
  const P = cd.mkPointFixed("P", add(A.x, b), A.y);
  const B = cd.mkPointFixed("B", add(P.x, a), P.y);
  const Q = cd.mkPointFixed("Q", B.x, sub(B.y, b));
  const C = cd.mkPointFixed("C", Q.x, sub(Q.y, a));
  const R = cd.mkPointFixed("R", sub(C.x, b), C.y);
  const D = cd.mkPointFixed("D", A.x, R.y);
  const S = cd.mkPointFixed("S", D.x, sub(A.y, a));

  const AS = cd.mkSegment(A, S, "a", true);
  const AP = cd.mkSegment(A, P, "b", true);
  const PS = cd.mkSegment(P, S, "c", true);
  const BP = cd.mkSegment(P, B, "a", true);
  const BQ = cd.mkSegment(B, Q, "b", true);
  const PQ = cd.mkSegment(P, Q, "c", true);
  const CQ = cd.mkSegment(C, Q, "a", true);
  const CR = cd.mkSegment(C, R, "b", true);
  const RQ = cd.mkSegment(R, Q, "c", true);
  const DR = cd.mkSegment(D, R, "a", true);
  const DS = cd.mkSegment(D, S, "b", true);
  const RS = cd.mkSegment(R, S, "c", true);
  return cd.build();
};

export default function PythagoreanComputedConstructor() {
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