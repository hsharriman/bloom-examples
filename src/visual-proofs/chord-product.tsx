import {
  canvas, concatenatePaths,
  constraints,
  cos,
  Diagram,
  DiagramBuilder, makePath,
  MathPI, pathFromPoints,
  Renderer,
  sin, sub,
  useDiagram,
  Vec2,
  mul,
  ops, neg
} from "@penrose/bloom";
import {ChangeEvent, useEffect, useMemo, useState} from "react";

const buildDiagram = async (numChords: number) => {
  const db = new DiagramBuilder(canvas(800, 400));
  const {
    type,
    input,
    forall,
    line,
    circle,
    ensure,
    build,
    layer
  } = db;

  const mainCircleRad = 150;
  const mainCircleCenter = [-200, 0];

  const mainCircle = circle({
    center: mainCircleCenter as Vec2,
    fillColor: [0, 0, 0, 0],
    strokeColor: [0, 0, 0, 1],
    strokeWidth: 2,
    r: mainCircleRad,
  });

  const draggableCenter = circle({
    center: [
      input({ name: "center-x", init: mainCircleCenter[0], optimized: false }),
      input({ name: "center-y", init: mainCircleCenter[1], optimized: false })
    ],
    r: 5,
    fillColor: [0, 0, 0, 1],
    drag: true,
    dragConstraint: ([x, y]) => {
      return [Math.min(mainCircleCenter[0], Math.max(mainCircleCenter[0] + mainCircleRad, x)), y];
    },
  })

  for (let i = 0; i < numChords; i++) {
    const angle = 2 * Math.PI / numChords * i;
    const chord = line({
      start: draggableCenter.center,
      end: [
        mainCircleCenter[0] + Math.cos(angle) * mainCircleRad,
        mainCircleCenter[1] + Math.sin(angle) * mainCircleRad,
      ],
      strokeWidth: 2,
    });

    layer(chord, draggableCenter);
  }

  return await build();
}

export default function ChordProductDiagram() {
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [numChords, setNumChords] = useState<number>(6);

  useEffect(() => {
    buildDiagram(numChords).then(setDiagram);
  }, [numChords]);

  const onSliderChange = useMemo(() => (e: ChangeEvent) => {
    setNumChords(Number.parseInt((e.target as HTMLInputElement).value));
  }, []);

  return (
    <div>
      <div style={{ width: "50em" }}>
        <Renderer diagram={diagram} />
      </div>
      <input style={{ margin: "auto", width: "100%" }} type={"range"} min={2} max={20} onChange={onSliderChange} value={numChords}/>
    </div>
  );
}