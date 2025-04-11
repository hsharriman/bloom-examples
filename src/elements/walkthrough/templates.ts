import { ConstructionStep } from "../ElementsPage";

export const pointStep = (
  name: string,
  coords?: [number, number]
): ConstructionStep => ({
  resultNames: [name],
  action: "mkPoint",
  coords,
  args: [],
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

export const copySegmentStep = (
  s: string,
  p: string,
  newPt: string
): ConstructionStep => ({
  resultNames: [`${p}${newPt}`, newPt],
  action: "mkCopySegment",
  args: [s, p],
  description: `Copy the segment ${s} to point ${p}`,
});

export const copySegmentOnSegmentStep = (
  s: string,
  p1: string,
  p2: string,
  newPt: string
): ConstructionStep => ({
  resultNames: [newPt],
  action: "mkCopySegmentToSegment",
  args: [s, p1, p2],
  description: `Copy the segment ${s} onto segment ${p1}${p2} starting from point ${p1}`,
});

export const triangleStep = (
  p1: string,
  p2: string,
  p3: string,
  focus?: boolean
): ConstructionStep => ({
  resultNames: [`${p1}${p2}${p3}`, `${p1}${p2}`, `${p2}${p3}`, `${p1}${p3}`],
  action: "mkTriangle",
  focus,
  args: [p1, p2, p3],
  description: `Construct a triangle between points ${p1}, ${p2}, ${p3}`,
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

export const triangleFromSegmentStep = (
  s1: string,
  s2: string,
  s3: string
): ConstructionStep => ({
  resultNames: [`${s1}${s2}${s3}`],
  action: "mkTriangleFromSegments",
  args: [s1, s2, s3],
  description: `Construct a triangle with side lengths ${s1}, ${s2}, ${s3}`,
});

export const collinearStep = (s: string, p: string): ConstructionStep => ({
  resultNames: [],
  action: "mkCollinear",
  args: [s, p],
  description: `Make point ${p} lie on segment ${s}`,
});

// use for init steps only
export const initLinesParallelStep = (
  s1: string,
  s2: string
): ConstructionStep => ({
  resultNames: [],
  action: "mkLinesParallel",
  args: [s1, s2],
  description: `(usable in givens only) Make segments ${s1} and ${s2} parallel`,
});

export const moveAngleStep = (
  p1: string,
  p2: string,
  p3: string,
  newCorner: string
): ConstructionStep => ({
  resultNames: [],
  action: "mkCopyAngle",
  args: [p1, p2, p3],
  description: `Copy angle ${p1}${p2}${p3} to ${newCorner}`,
});

export const parallelStep = (
  s: string,
  p: string,
  newPt: string
): ConstructionStep => ({
  resultNames: [`${p}${newPt}`, newPt],
  action: "mkParallelLine",
  args: [s, p],
  description: `Make a segment that is parallel to ${s} extending from ${p}`,
});

export const parallelStepBwPoints = (
  s: string,
  p: string,
  p2: string
): ConstructionStep => ({
  resultNames: [`${p}${p2}`],
  action: "mkParallelLineBwPoints",
  args: [s, p, p2],
  description: `Make a segment that is parallel to ${s} between ${p} and ${p2}`,
});

export const perpendicularStep = (
  s: string,
  corner: string,
  newPt: string
): ConstructionStep => ({
  resultNames: [`${corner}${newPt}`, newPt],
  action: "mkPerpendicularLine",
  args: [s, corner],
  description: `Construct a line that is perpendicular to ${s} from ${corner}`,
});

export const horizontalSegmentStep = (
  p1: string,
  p2: string
): ConstructionStep => ({
  resultNames: [`${p1}${p2}`],
  action: "mkHorizontalSegment",
  args: [p1, p2],
  description: `Construct a horizontal segment ${p1}${p2}`,
});
