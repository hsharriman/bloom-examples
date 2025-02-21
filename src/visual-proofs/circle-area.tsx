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
    rectangle,
    polygon,
    group
  } = db;

  const SliceRect = type();
  const SliceCircle = type();

  const sliceRect = SliceRect();
  const sliceCircle = SliceCircle();

  const circleRad = 100;
  const sliceAngle = 2 * Math.PI / numSlices;

  forall({ s: SliceCircle }, ({ s }) => {
    s.circle = circle({
      r: circleRad,
      fillColor: [0, 0, 0, 0],
      strokeColor: [0, 0, 0, 1],
      strokeWidth: 2,
      center: [-200, 0]
    });

    s.lines = [];
    for (let i = 0; i < numSlices; i++) {
      const angle = sliceAngle * i;
      s.lines.push(line({
        start: s.circle.center,
        end: ops.vadd(s.circle.center, [mul(cos(angle), s.circle.r), mul(sin(angle), s.circle.r)]) as Vec2,
      }))
    }
  });

  forall({ r: SliceRect }, ({ r }) => {
    r.rect = rectangle({
      center: [200, 0],
      width: circleRad * Math.PI,
      height: circleRad,
      fillColor: [0, 0, 0, 0],
      strokeColor: [0, 0, 0, 1],
      strokeWidth: 2,
    });

    let nextBaseVert = [sub(r.rect.center[0], r.rect.width / 2), sub(r.rect.center[1], r.rect.height / 2)] as Vec2;
    let lastBaseVert = ops.vadd(nextBaseVert, ops.vmul(circleRad, [neg(sin(sliceAngle / 2)), cos(sliceAngle / 2)])) as Vec2;
    for (let i = 0; i < numSlices; i++) {
      const v1 = nextBaseVert;
      const v2 = lastBaseVert;
      const v3 = ops.vadd(lastBaseVert, [mul(2 * circleRad, sin(sliceAngle / 2)), 0]) as Vec2;

      const v2prime = ops.vadd(v1, ops.vmul(2, ops.vsub(v2, v1))) as Vec2;
      const v3prime = ops.vadd(v1, ops.vmul(2, ops.vsub(v3, v1))) as Vec2;

      const c = circle({
        r: circleRad,
        center: v1,
      });

      const g = group({
        shapes: [c],
        clipPath: polygon({
          points: [v1, v2prime, v3prime],
        })
      });

      nextBaseVert = v3;
      lastBaseVert = v1;
    }
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