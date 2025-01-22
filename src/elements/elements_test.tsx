import {Diagram, Renderer} from "@penrose/bloom";
import {Construction} from "./elements.js";
import {useEffect, useMemo, useState} from "react";

const buildDiagrams = async () : Promise<Diagram[]> => {
  const construction = new Construction();

  const A = construction.mkPoint(-50, 0);
  const B = construction.mkPoint(50, 0);
  const AB = construction.mkSegment(A, B);

  const diagram1 = await construction.build();

  const CircAB = construction.mkCircle(A, B);
  const CircBA = construction.mkCircle(B, A);

  const diagram2 = await construction.build();

  const [C, D] = construction.mkCircleCircleIntersection(CircAB, CircBA);
  const AC = construction.mkSegment(A, C);
  const BC = construction.mkSegment(B, C);

  const diagram3 = await construction.build();

  return [diagram1, diagram2, diagram3];
};

export default function ElementsTest() {
  const [diagrams, setDiagrams] = useState<Diagram[] | null>(null);

  useEffect(() => {
    (async () => {
      setDiagrams(await buildDiagrams())
    })()
  }, []);

  return (
    <>
      {diagrams && diagrams.map((diagram) =>
        <div style={{
          border: "2px solid black",
          width: "50em",
          height: "50em",
        }}>
          <Renderer diagram={diagram} />
        </div>
      )}
    </>
  );
}