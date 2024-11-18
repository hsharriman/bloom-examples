import {
  DiagramBuilder,
  Renderer,
  canvas,
  constraints,
  useDiagram,
} from "@penrose/bloom";

const NUM_BALLS = 20;
export const ballbox = async () => {
  const db = new DiagramBuilder(canvas(800, 800), "");
  const { type, rectangle, circle, build, ensure, forall } = db;

  const Ball = type();
  const Box = type();

  const box = Box();
  Array.from({ length: NUM_BALLS }).map(() => Ball());

  box.icon = rectangle({
    center: [0, 0],
    width: 600,
    height: 600,
    strokeWidth: 5,
    fillColor: [0, 0, 0, 0.1],
  });

  forall({ b: Ball }, ({ b }) => {
    b.icon = circle({
      r: 50,
      drag: true,
    });
    ensure(constraints.contains(box.icon, b.icon, b.icon.r));
  });

  forall({ b1: Ball, b2: Ball }, ({ b1, b2 }) => {
    ensure(constraints.disjoint(b1.icon, b2.icon));
  });

  return await build();
};

export default function BallBox() {
  const ballBoxDiagram = useDiagram(ballbox);

  if (!ballBoxDiagram) {
    return <div>Loading...</div>;
  }
  return (
    <div
      style={{
        marginTop: "2em",
        height: "20em",
      }}
    >
      <Renderer diagram={ballBoxDiagram} />
    </div>
  );
}
