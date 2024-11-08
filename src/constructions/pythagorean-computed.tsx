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
  const X = cd.mkPoint("X", true, true, [leftEdge, topEdge-50]);
  const Z = cd.mkPoint("Z", true, true, [leftEdge+50, topEdge]);
  const XY = cd.mkSegment(X, Y, "a");
  const a = ops.vdist([X.x, X.y],[Y.x, Y.y])
  const YZ = cd.mkSegment(Y, Z, "b", false);
  const b = ops.vdist([Z.x, Z.y],[Y.x, Y.y])
  cd.mkSegment(X, Z, "c", false);
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
  segments[0] = cd.mkSegment(A, S, "a", false);
  segments[1] = cd.mkSegment(A, P, "b", false);
  segments[2] = cd.mkSegment(P, S, "c", false);
  segments[3] = cd.mkSegment(P, B, "a", false);
  segments[4] = cd.mkSegment(B, Q, "b", false);
  segments[5] = cd.mkSegment(P, Q, "c", false);
  segments[6] = cd.mkSegment(C, Q, "a", false);
  segments[7] = cd.mkSegment(C, R, "b", false);
  segments[8] = cd.mkSegment(R, Q, "c", false);
  segments[9] = cd.mkSegment(D, R, "a", false);
  segments[10] = cd.mkSegment(D, S, "b", false);
  segments[11] = cd.mkSegment(R, S, "c", false);

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
  const p4 = cd.mkPointFixed("p4", add(p1.x, b), sub(p1.y, a), false);

  const p6 = cd.mkPointFixed("p6", add(p4.x, a), p4.y, true);
  const p7 = cd.mkPointFixed("p7", p6.x, sub(p4.y, b), true);
  const p8 = cd.mkPointFixed("p8", p4.x, p7.y, true);
  const p9 = cd.mkPointFixed("p9", p1.x, p7.y, true);
  const p10 = cd.mkPointFixed("p9", p7.x, p1.y, true);
  segments[12] = cd.mkSegment(p1, p9);
  segments[13] = cd.mkSegment(p9, p7);
  segments[14] = cd.mkSegment(p7, p10);
  segments[15] = cd.mkSegment(p10, p1);
  triangles[4] = cd.mkTriangle(p1, p2, p3, green);
  triangles[5] = cd.mkTriangle(p2, p3, p4, red);
  triangles[6] = cd.mkTriangle(p4, p6, p7, blue);
  triangles[7] = cd.mkTriangle(p4, p7, p8, purple);

  cd.ensureDisjoint(triangles[0], segments);
  cd.ensureDisjoint(triangles[1], segments);
  cd.ensureDisjoint(triangles[2], segments);
  cd.ensureDisjoint(triangles[3], segments);
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