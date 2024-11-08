import { ConstructionDomain, Segment, Triangle } from "./constructions.js";
import { Renderer, useDiagram, ops, add, sub } from "@penrose/bloom";

const buildDiagram = async () => {
  const width=600;
  const height=600;
  const margin = 10;
  const leftEdge = -width/2 + margin;
  const topEdge = height/2 - margin;
  const square1_x = leftEdge;
  const square1_y = topEdge - 200;
  const square2_x = 0;
  const square2_y = topEdge - 200;
  const cd = new ConstructionDomain(width, height);

  const Y = cd.mkPointFixed("Y", leftEdge, topEdge);
  const X = cd.mkPoint("X", false, true, [leftEdge, topEdge-50]);
  const Z = cd.mkPoint("Z", false, true, [leftEdge+120, topEdge]);
  const XY = cd.mkSegment(X, Y, "a", true);
  const a = ops.vdist([X.x, X.y],[Y.x, Y.y])
  const YZ = cd.mkSegment(Y, Z, "b", true);
  const b = ops.vdist([Z.x, Z.y],[Y.x, Y.y])
  cd.mkSegment(Z, X, "c", true);
  cd.ensureX(X, Y.x);
  cd.ensureY(Z, Y.y);


  const A = cd.mkPointFixed("A", square1_x, square1_y, false);
  const P = cd.mkPointFixed("P", add(A.x, b), A.y, false);
  const B = cd.mkPointFixed("B", add(P.x, a), P.y, false);
  const Q = cd.mkPointFixed("Q", B.x, sub(B.y, b), false);
  const C = cd.mkPointFixed("C", Q.x, sub(Q.y, a), false);
  const R = cd.mkPointFixed("R", sub(C.x, b), C.y, false);
  const D = cd.mkPointFixed("D", A.x, R.y, false);
  const S = cd.mkPointFixed("S", D.x, sub(A.y, a), false);
  
  const segments : Segment[] = [];
  segments[0] = cd.mkSegment(S, A, "a", true);
  segments[1] = cd.mkSegment(A, P, "b", true);
  segments[2] = cd.mkSegment(P, S, "c", true);
  segments[3] = cd.mkSegment(P, B, "a", true);
  segments[4] = cd.mkSegment(B, Q, "b", true);
  segments[5] = cd.mkSegment(Q, P, "c", true);
  segments[6] = cd.mkSegment(Q, C, "a", true);
  segments[7] = cd.mkSegment(C, R, "b", true);
  segments[8] = cd.mkSegment(R, Q, "c", true);
  segments[9] = cd.mkSegment(R, D, "a", true);
  segments[10] = cd.mkSegment(D, S, "b", true);
  segments[11] = cd.mkSegment(S, R, "c", true);

  const triangles : Triangle[] = [];
  const green = [0.176, 0.478, 0.129, 0.8];
  const blue = [0.176, 0.478, 0.839, 0.8];
  const red = [0.659, 0.114, 0.91, 0.8];
  const purple = [0.788, 0.22, 0.059, 0.8];

  triangles[0] = cd.mkTriangle(A, P, S, green);
  triangles[1] = cd.mkTriangle(P, B, Q, blue);
  triangles[2] = cd.mkTriangle(Q, C, R, red);
  triangles[3] = cd.mkTriangle(R, D, S, purple);

  const p1 = cd.mkPointFixed("p1", square2_x, square2_y, false);
  const p2 = cd.mkPointFixed("p2", add(p1.x, b), p1.y, false);
  const p3 = cd.mkPointFixed("p3", p1.x, sub(p1.y, a), false);
  const p4 = cd.mkPointFixed("p4", p2.x, p3.y, false);

  const p6 = cd.mkPointFixed("p6", add(p4.x, a), p4.y, false);
  const p7 = cd.mkPointFixed("p7", p6.x, sub(p4.y, b), false);
  const p8 = cd.mkPointFixed("p8", p4.x, p7.y, false);
  const p9 = cd.mkPointFixed("p9", p1.x, p7.y, false);
  const p10 = cd.mkPointFixed("p10", p7.x, p1.y, false);
  segments[12] = cd.mkSegment(p1, p9);
  segments[13] = cd.mkSegment(p9, p7);
  segments[14] = cd.mkSegment(p7, p10);
  segments[15] = cd.mkSegment(p10, p1);
  segments[16] = cd.mkSegment(p2, p4, "a", true);
  segments[17] = cd.mkSegment(p4, p6, "a", true);
  segments[18] = cd.mkSegment(p8, p4, "b", true);
  segments[19] = cd.mkSegment(p4, p3, "b", true);
  segments[20] = cd.mkSegment(p4, p7);
  segments[21] = cd.mkSegment(p2, p3);
  triangles[4] = cd.mkTriangle(p1, p2, p3, green);
  triangles[5] = cd.mkTriangle(p2, p3, p4, red);
  triangles[6] = cd.mkTriangle(p4, p6, p7, blue);
  triangles[7] = cd.mkTriangle(p4, p7, p8, purple);

  return cd.build();
};

export default function PythagoreanComputedConstructor() {
    const diagram = useDiagram(buildDiagram);
  
    return (
      <div
        style={{
          width: "50em",
          height: "50em"
        }}
      >
        <Renderer diagram={diagram} />
      </div>
    );
  }