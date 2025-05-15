import {canvas, constraints, DiagramBuilder} from "@penrose/bloom";

export const buildDiscDiagram = async () => {
  const width = 400;
  const height = 400;
  const numCircles = 20;

  const { circle, ensure, type, forall, build } =
    new DiagramBuilder(canvas(width, height), "", 1000);

  const circleRad = 20;
  const containerRad = 190;
  const containerBorder = 2;

  const Circle = type();
  const Enclosure = type();

  for (let i = 0; i < numCircles; ++i) {
    Circle();
  }

  const enclosure = Enclosure();
  enclosure.icon = circle({
    r: containerRad,
    center: [0, 0],
    strokeWidth: containerBorder,
    strokeColor: [0, 0, 0, 1],
    fillColor: [0, 0, 0, 0],
  });

  forall({ c: Circle }, ({ c }) => {
    const dragConstraint = ([x, y]: [number, number]): [number, number] => {
      const norm = Math.sqrt(x * x + y * y);
      const maxNorm =
        containerRad -
        containerBorder / 2 -
        circleRad;
      if (norm <= maxNorm) {
        return [x, y];
      } else {
        return [(x / norm) * maxNorm, (y / norm) * maxNorm];
      }
    };

    c.icon = circle({
      r: circleRad,
      drag: true,
      dragConstraint,
    });

    c.icon.fillColor[3] = 1;

    ensure(constraints.contains(enclosure.icon, c.icon, containerBorder / 2));
  });

  forall({ c1: Circle, c2: Circle }, ({ c1, c2 }) => {
    ensure(constraints.disjoint(c1.icon, c2.icon));
  });

  return await build();
};