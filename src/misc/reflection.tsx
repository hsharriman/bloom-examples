import {angleBetween, angleFrom, canvas, constraints, DiagramBuilder, useDiagram} from "@penrose/bloom";
import {mul, ops} from "@penrose/core";

export const buildReflectionDiagram = async () => {
  const db = new DiagramBuilder(canvas(800, 400), "");
  const {
    type,
    line,
    circle,
    build,
    input,
    ensure,
    forall,
  } = db;

  const Endpoint = type();
  const Ray = type();
  const Mirror = type();

  const start = Endpoint();
  const end = Endpoint();
  const ray1 = Ray();
  const ray2 = Ray();
  const mirror = Mirror();

  mirror.level = -150;
  mirror.icon = line({
    start: [-400, mirror.level],
    end: [400, mirror.level],
    strokeWidth: 5,
    strokeColor: [0, 0, 0, 0.5],
  });

  start.center = [
    input({ init: -300, optimized: false }),
    input({ init: 100, optimized: false }),
  ];
  end.center = [
    input({ init: 300, optimized: false }),
    input({ init: 100, optimized: false }),
  ];

  forall({ e: Endpoint }, ({ e }) => {
    e.dot = circle({
      center: e.center,
      r: 5,
      fillColor: [0, 0, 0, 1],
    });

    e.handle = circle({
      center: e.center,
      r: 40,
      drag: true,
      fillColor: [0, 0, 0, 0.1],
    });
  });

  const reflectPoint = [input({ init: 0 }), mirror.level];

  ray1.start = start.center;
  ray1.end = reflectPoint;

  ray2.start = reflectPoint;
  ray2.end = end.center;

  forall({ r: Ray }, ({ r }) => {
    r.icon = line({
      start: r.start,
      end: r.end,
      endArrowhead: "straight",
      // purple
      strokeColor: [0.5, 0, 0.5, 1],
      strokeWidth: 3,
    });
    r.dir = ops.vnormalize(ops.vsub(r.end, r.start));
  });

  const alpha = angleFrom(ray1.dir, [1, 0]);
  const beta = angleFrom([1, 0], ray2.dir);
  ensure(constraints.equal(alpha, beta));

  return await build();
};