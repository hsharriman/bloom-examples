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
  ops, neg, div
} from "@penrose/bloom";
import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {Num} from "@penrose/core";

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
    layer,
    equation,
    bindToInput,
  } = db;

  const mainCircleRad = 150;
  const mainCircleCenter = [-200, 0];

  const mainCircle = circle({
    center: mainCircleCenter as Vec2,
    fillColor: [0, 0, 0, 0],
    strokeColor: [0, 0, 0, 1],
    strokeWidth: 3,
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
    dragConstraint: ([x]) => {
      return [Math.max(mainCircleCenter[0], Math.min(mainCircleCenter[0] + mainCircleRad, x)), mainCircleCenter[1]];
    },
  })

  let prod: Num = 1;
  for (let i = 0; i < numChords; i++) {
    const angle = 2 * Math.PI / numChords * i;
    const delta = [Math.cos(angle) * mainCircleRad, Math.sin(angle) * mainCircleRad];
    const chord = line({
      start: draggableCenter.center,
      end: ops.vadd(mainCircleCenter, delta) as Vec2,
      strokeWidth: i == 0 ? 3 : 2,
      strokeColor: i == 0 ? [1, 0, 0, 1] : [0, 0, 0, 1],
    });

    equation({
      string: `\\zeta_{${i}}`,
      center: ops.vadd(mainCircleCenter, ops.vmul(1.1, delta)) as Vec2,
    });

    layer(chord, draggableCenter);

    if (i > 0) {
      prod = mul(prod, div(ops.vdist(chord.end, chord.start), mainCircleRad));
    }
  }

  equation({
    string: `\\lim_{z\\to\\zeta_0}\\frac{|z - \\zeta_0||z - \\zeta_1|\\ldots|z-\\zeta_{${numChords - 1}}|}{|z - \\zeta_0|}`,
    center: [200, 100]
  });

  equation({
    string: `= \\lim_{z\\to 1}\\frac{\\left|z^{n+1}-1\\right|}{|z - 1|}`,
    center: [139, 50]
  });

  equation({
    string: `= \\lim_{z\\to 1}1 + z + \\ldots + z^{${numChords - 1}}`,
    center: [155, 0]
  });
  equation({
    string: `= ${numChords}`,
    center: [94.5, -50]
  });

  bindToInput(prod, { name: "product" });

  return await build();
}

export default function ChordProductDiagram() {
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [numChords, setNumChords] = useState<number>(6);
  const [product, setProduct] = useState(0);

  useEffect(() => {
    buildDiagram(numChords).then(setDiagram);
  }, [numChords]);

  useEffect(() => {
    diagram?.addInputEffect("product", setProduct);
  }, [diagram]);

  const onSliderChange = useMemo(() => (e: ChangeEvent) => {
    setNumChords(Number.parseInt((e.target as HTMLInputElement).value));
  }, []);

  return (
    <div>
      <div style={{ width: "50em" }}>
        <Renderer diagram={diagram} />
      </div>
      <p>product: {product}</p>
      <input style={{ margin: "auto", width: "100%" }} type={"range"} min={2} max={20} onChange={onSliderChange} value={numChords}/>
    </div>
  );
}