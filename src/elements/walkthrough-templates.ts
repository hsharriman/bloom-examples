import { ConstructionStep } from "./elements-walkthrough";

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
  pt: string,
  newPt: string
): ConstructionStep => ({
  resultNames: [newPt, `${pt}${newPt}`],
  action: "mkEqualSegment",
  args: [s, pt],
  description: `Construct a segment with the same length as ${s} from point ${pt}`,
});
