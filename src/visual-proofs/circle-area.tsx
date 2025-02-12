import {
  canvas,
  constraints,
  cos,
  Diagram,
  DiagramBuilder,
  MathPI,
  Renderer,
  sin,
  useDiagram,
  Vec2
} from "@penrose/bloom";
import {mul, ops} from "@penrose/core";
import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {build} from "vite";

const buildDiagram = async (numSlices: number = 5) => {
  const db = new DiagramBuilder(canvas(800, 400));
  const {
    type,
    input,
    forall,
    line,
    circle,
    ensure,
    build,
    bindToInput,
    rectangle
  } = db;

  const SliceRect = type();
  const SliceCircle = type();

  const sliceRect = SliceRect();
  const sliceCircle = SliceCircle();

  forall({ s: SliceCircle }, ({ s }) => {
    s.circle = circle({
      r: 100,
      fillColor: [0, 0, 0, 0],
      strokeColor: [0, 0, 0, 1],
      strokeWidth: 2,
      center: [-200, 0]
    });

    s.lines = [];
    for (let i = 0; i < numSlices; i++) {
      const angle = 2 * Math.PI / numSlices * i;
      s.lines.push(line({
        start: s.circle.center,
        end: ops.vadd(s.circle.center, [mul(cos(angle), s.circle.r), mul(sin(angle), s.circle.r)]) as Vec2,
      }))
    }
  });

  forall({ r: SliceRect }, ({ r }) => {
    r.rect = rectangle({
      center: [200, 0],
      width: 400,
      height: 400 / (2 * Math.PI),
    })
  });

  return await build();
}

export default function CircleAreaDiagram() {
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [numSlices, setNumSlices] = useState<number>(5);

  useEffect(() => {
    buildDiagram(numSlices).then(setDiagram);
  }, [numSlices]);

  const onSliderChange = useMemo(() => (e: ChangeEvent) => {
    setNumSlices(Number.parseInt((e.target as HTMLInputElement).value));
  }, []);

  return (
    <div>
      <div style={{ width: "50em" }}>
        <Renderer diagram={diagram} />
      </div>
      <input style={{ margin: "auto", width: "100%" }} type={"range"} min={2} max={20} onChange={onSliderChange} value={numSlices}/>
    </div>
  );
}