import { ConstructionStep } from "../ElementsPage";

export const pointStep = (
  name: string,
  focus: boolean = false
): ConstructionStep => ({
  resultNames: [name],
  action: "mkPoint",
  args: [],
  focus,
  description: "Place a point",
});

export const circleStep = (
  p1: string,
  p2: string,
  focus: boolean = false
): ConstructionStep => ({
  resultNames: [`Circ${p1}${p2}`],
  action: "mkCircle",
  args: [p1, p2],
  focus,
  description: `Construct a circle with center ${p1} and and ${p2} on the circumference`,
});

export const intersectionStep = (
  c1: string,
  c2: string,
  c1Type: string,
  c2Type: string,
  focus: boolean = false
): ConstructionStep => {
  // TODO doesn't correctly handle intersections that have 2 pts
  return {
    resultNames: [`${c1}${c2}`],
    action: "mkIntersections",
    args: [`${c1Type}${c1}`, `${c2Type}${c2}`],
    description: `Find the intersection points of the ${c1Type} (${c1}) and ${c2Type} (${c2})`,
    focus,
  };
};

export const segmentStep = (
  p1: string,
  p2: string,
  focus: boolean = false
): ConstructionStep => ({
  resultNames: [`${p1}${p2}`],
  action: "mkSegment",
  args: [p1, p2],
  description: `Construct the segment between ${p1} and ${p2}`,
  focus,
});

export const lineExtensionStep = (
  s: string,
  newPt: string
): ConstructionStep => ({
  resultNames: [`${s[1]}${newPt}`, newPt],
  action: "mkLineExtension",
  args: [s[0], s[1]],
  description: `Extend the line ${s}`,
});

export const equalSegmentStep = (
  s: string,
  p1: string,
  p2: string
): ConstructionStep => ({
  resultNames: [`${p1}${p2}`],
  action: "mkEqualSegment",
  args: [s, p1, p2],
  description: `Make a segment ${p1}${p2} with the same length as ${s}`,
});

export const cutLengthStep = (
  p1: string,
  p2: string,
  newPt: string
): ConstructionStep => ({
  resultNames: [newPt, `${p1}${newPt}`],
  action: "mkCutGivenLen",
  args: [p1, p2],
  description: `Cut ${p1}${p2} to length ${p1}${newPt} (selecting ${p1} -> ${p2})`,
});

export const equilateralTriangleStep = (
  p1: string,
  p2: string,
  newPt: string
): ConstructionStep => ({
  resultNames: [
    `${p1}${p2}${newPt}`,
    newPt,
    `${p1}${p2}`,
    `${p2}${newPt}`,
    `${p1}${newPt}`,
  ],
  action: "mkEquilateralTriangle",
  args: [p1, p2],
  description: `Construct an equilateral triangle with side length ${p1}${p2}`,
});
