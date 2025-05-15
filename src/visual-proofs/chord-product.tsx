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
  ops, neg, div, angleBetween, angleFrom
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
  const chords = [];
  for (let i = 0; i < numChords; i++) {
    const chord = line({
      start: draggableCenter.center,
      strokeWidth: i == 0 ? 3 : 2,
      strokeColor: i == 0 ? [1, 0, 0, 1] : [0, 0, 0, 1],
    });
    chords.push(chord);

    const disp = ops.vsub(chord.end, mainCircleCenter);
    equation({
      string: `\\zeta^{${i}}`,
      center: ops.vadd(mainCircleCenter, ops.vmul(1.1, disp)) as Vec2,
    });

    layer(chord, draggableCenter);

    if (i > 0) {
      prod = mul(prod, div(ops.vdist(chord.end, chord.start), mainCircleRad));
    }
  }

  ensure(constraints.equal(ops.vsub(chords[0].end, mainCircleCenter)[0], mainCircleRad));

  const targetAngle = 2 * Math.PI / numChords;
  const center = mainCircleCenter;
  for (let i = 0; i < numChords - 1; i++) {
    const v1 = ops.vsub(chords[i].end, center);
    const v2 = ops.vsub(chords[(i + 1) % numChords].end, center);
    const theta = angleFrom(v1, v2);
    ensure(constraints.equal(theta, targetAngle));
  }

  for (let i = 0; i < numChords; i++) {
    const distFromCenter = ops.vdist(chords[i].end, mainCircleCenter);
    ensure(constraints.equal(distFromCenter, mainCircleRad));
  }

  equation({
    string: `\\lim_{z\\to 1}\\frac{|z - 1||z - \\zeta_1|\\ldots|z-\\zeta_{${numChords - 1}}|}{|z - 1|}`,
    center: [200, 100]
  });

  equation({
    string: `= \\lim_{z\\to 1}\\frac{\\left|z^{${numChords}}-1\\right|}{|z - 1|}`,
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
  const [centerx, setCenterX] = useState(0);
  const [centery, setCenterY] = useState(0);

  useEffect(() => {
    (async () => {
      const diagram = await buildDiagram(numChords);
      setDiagram(diagram);
    })();
  }, []);

  useEffect(() => {
    if (!diagram) return;

    diagram.addInputEffect("product", setProduct);
    diagram.addInputEffect("center-x", setCenterX);
    diagram.addInputEffect("center-y", setCenterY);

    setProduct(diagram.getInput("product"));
    setCenterX(diagram.getInput("center-x"));
    setCenterY(diagram.getInput("center-y"));
  }, [diagram]);

  const onSliderChange = useMemo(() => async (e: ChangeEvent) => {
    const newNumChords = Number.parseInt((e.target as HTMLInputElement).value);
    setNumChords(newNumChords);

    const newDiagram = await buildDiagram(newNumChords);
    setDiagram(newDiagram);

    newDiagram.setInput("center-x", centerx);
    newDiagram.setInput("center-y", centery);
  }, [centerx, centery]);

  const rounded = Math.round(product * 1000) / 1000;

  return (
    <div>
      <div style={{width: "100%"}}>
        <Renderer diagram={diagram}/>
      </div>
      {/* show product with only 3 decimal places */}
      <b style={{marginLeft: "12em", fontSize: "24px"}}>Chord Length Product: {rounded.toFixed(2)}</b>
      <div style={{
        width: "25%",
        position: "relative",
        left: "60%",
        bottom: "12em",

      }}>
        <p style={{textAlign: "center", fontSize: "24px"}}>Number of Chords: {numChords}</p>
        <input style={{width: "100%"}} type={"range"} min={2} max={10} onChange={onSliderChange} value={numChords}/>
      </div>
    </div>
  );
}