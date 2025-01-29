import {Diagram, Renderer} from "@penrose/bloom";
import {canvasWidth, Construction, ConstructionElement, Point} from "./elements.js";
import {useEffect, useRef, useState} from "react";

const construction = new Construction();
let setupFired = false;

export default function ElementsTest() {
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [currAction, setCurrAction] = useState<ConstructionElement["tag"] | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // setup
  useEffect(() => {
      (async () => {
        if (setupFired) return;
        setupFired = true;

        const A = construction.mkPoint(-50, 0, "A");
        const B = construction.mkPoint(50, 0, "B");

        setDiagram(await construction.build());
      })();
  }, []);

  const addPointOnClick = async (e: PointerEvent) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const bbox = canvas.getBoundingClientRect();
    const x = ((e.clientX - bbox.left) / bbox.width - 0.5) * canvasWidth;
    const y = -((e.clientY - bbox.top) / bbox.height - 0.5) * canvasWidth;
    construction.mkPoint(x, y);
    canvas.removeEventListener("pointerdown", addPointOnClick);
    setDiagram(await construction.build());
    setCurrAction(null);
  };

  return (
    <>
      {/* Add Point, Connect points to segment, and circle buttons */}
      <button
        onClick={async () => {
          if (canvasRef.current) {
            canvasRef.current.addEventListener("pointerdown", addPointOnClick);
          }
          setDiagram(await construction.build());
          setCurrAction("Point");
        }}
        disabled={currAction === "Point"}
      >Add Point</button>

      <button
        onClick={async () => {
          setCurrAction("Segment");
          const selected: Point[] = [];
          const handlers: Map<Point, any> = new Map();
          for (const el of construction.elements) {
            if (el.tag !== "Point") continue;
            const handler = async () => {
              console.log("Point clicked");
              construction.toggleSelect(el);

              if (selected.length === 1 && selected[0] === el) {
                selected.pop();
              } else {
                selected.push(el);
              }

              if (selected.length === 2) {
                const [A, B] = selected;
                construction.mkSegment(A, B);
                construction.toggleSelect(A);
                construction.toggleSelect(B);
                for (const [el, handler] of handlers) {
                  construction.db.removeEventListener(el.icon, "pointerdown", handler);
                }
                setDiagram(await construction.build());
                setCurrAction(null);
              }
            };
            construction.db.addEventListener(el.icon, "pointerdown", handler);
            handlers.set(el, handler);
          }
          setDiagram(await construction.build());
        }}
        disabled={currAction === "Segment"}
      >Connect Points</button>

      <div
        style={{
          border: "2px solid black",
          width: "50em",
          height: "50em",
        }}
        ref={canvasRef}
      >
        <Renderer diagram={diagram} />
      </div>
    </>
  );
}