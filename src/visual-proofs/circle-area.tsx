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
  Vec2,
  neg,
  mul,
  ops,
  sub,
  objectives,
  add,
  div
} from "@penrose/bloom";
import {ChangeEvent, useEffect, useMemo, useState} from "react";

const hsvToRgb = (h: number, s: number, v: number): number[] => {
  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [r, g, b, 1] as number[];
}

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
    group,
    polygon,
    layer,
    equation,
    encourage
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
      const nextAngle = sliceAngle * (i + 1);

      const v0 = s.circle.center;
      const v1 = ops.vadd(s.circle.center, ops.vmul(2, [mul(cos(angle), s.circle.r), mul(sin(angle), s.circle.r)]));
      const v2 = ops.vadd(s.circle.center, ops.vmul(2, [mul(cos(nextAngle), s.circle.r), mul(sin(nextAngle), s.circle.r)]));

      const c = circle({
        r: circleRad,
        center: s.circle.center,
        fillColor: hsvToRgb(i / numSlices, 1, 1),
      });

      const g = group({
        shapes: [c],
        clipPath: polygon({
          points: [v0, v1 ,v2],
        }),
      });

      s.lines.push(line({
        start: s.circle.center,
        end: ops.vadd(s.circle.center, [mul(cos(angle), s.circle.r), mul(sin(angle), s.circle.r)]) as Vec2,
      }))
    }
  });

  forall({ r: SliceRect }, ({ r }) => {
    r.rect = rectangle({
      center: [200, 0],
      width: mul(circleRad, Math.PI),
      height: circleRad,
      fillColor: [0, 0, 0, 0],
      strokeColor: [0, 0, 0, 1],
      strokeWidth: 2,
    });

    let nextBase = ops.vsub(r.rect.center, ops.vmul(0.5, [r.rect.width, r.rect.height])) as Vec2;
    let nextEnd = ops.vadd(nextBase, ops.vmul(circleRad, [neg(sin(sliceAngle / 2)), cos(sliceAngle / 2)])) as Vec2;
    const dx = mul(2 * circleRad, sin(sliceAngle / 2));
    const gs = [];
    for (let i = 0; i < numSlices; i++) {
      const v0 = nextBase
      const v1 = nextEnd;
      const v2 = ops.vadd(v1, [dx, 0]) as Vec2;

      const v1prime = ops.vadd(v0, ops.vmul(2, ops.vsub(v1, v0))) as Vec2;
      const v2prime = ops.vadd(v0, ops.vmul(2, ops.vsub(v2, v0))) as Vec2;

      const c = circle({
        r: circleRad,
        center: v0,
        fillColor: hsvToRgb(i / numSlices, 1, 1),
      });

      const g = group({
        shapes: [c],
        clipPath: polygon({
          points: [v0, v1prime, v2prime]
        }),
      });
      gs.push(g);

      nextBase = v2;
      nextEnd = v0;

      layer(g, r.rect);
    }

    r.rLabel = equation({
      string: "r",
      fontSize: "32px",
      center: [sub(r.rect.center[0], add(div(r.rect.width, 2), 30)), r.rect.center[1]],
    });

    r.prLabel = equation({
      string: "\\pi r",
      fontSize: "32px",
      center: [r.rect.center[0], sub(r.rect.center[1], add(div(r.rect.height, 2), 30))],
    });
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