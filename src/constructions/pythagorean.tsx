import { ConstructionDomain } from "./constructions.js";
import { Renderer, useDiagram, constraints} from "@penrose/bloom";

const buildDiagram = async () => {
    const cd = new ConstructionDomain(400, 400);

    const A = cd.mkPoint("A", true);
    const B = cd.mkPoint("B", true);
    const C = cd.mkPoint("C", true);
    const D = cd.mkPoint("D", true);
    const AB = cd.mkSegment(A, B);
    const BC = cd.mkSegment(B, C);
    const CD = cd.mkSegment(C, D);
    const DA = cd.mkSegment(D, A);
    cd.ensurePerpendicular(AB, BC);
    cd.ensurePerpendicular(BC, CD);
    cd.ensurePerpendicular(CD, DA);
    cd.ensurePerpendicular(DA, AB);

    // const P = cd.mkPoint("P");
    // const Q = cd.mkPoint("Q");
    // const R = cd.mkPoint("R");
    // const S = cd.mkPoint("S");
    // const PQ = cd.mkSegment(P, Q);
    // const QR = cd.mkSegment(Q, R);
    // const RS = cd.mkSegment(R, S);
    // const SP = cd.mkSegment(S, P);

    return cd.build();
}

export default function PythagoreanConstructor() {
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