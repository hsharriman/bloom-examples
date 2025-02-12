import { ConstructionDescription } from "./elements-walkthrough.js";

export const Midpoint: ConstructionDescription = {
  name: "bisector",
  inputs: ["Point", "Point"],
  // TODO: maybe add initial positions for consistency? or a set seed
  initSteps: [
    {
      resultNames: ["A"],
      action: "mkPoint",
      args: [],
      focus: true,
    },
    {
      resultNames: ["B"],
      action: "mkPoint",
      args: [],
      focus: true,
    },
  ],
  steps: [
    {
      resultNames: ["CircAB"],
      action: "mkCircle",
      args: ["A", "B"],
      description:
        "Construct a circle with center A and and B on the circumference",
    },
    {
      resultNames: ["CircBA"],
      action: "mkCircle",
      args: ["B", "A"],
      description:
        "Construct a circle with center B and and A on the circumference",
    },
    {
      resultNames: ["C", "D"],
      action: "mkIntersections",
      args: ["CircAB", "CircBA"],
      description: "Find the intersection points of the two circles",
    },
    {
      resultNames: ["CD"],
      action: "mkSegment",
      args: ["C", "D"],
      description: "Construct the line through C and D",
    },
    {
      resultNames: ["AB"],
      action: "mkSegment",
      args: ["A", "B"],
      description: "Construct the line through A and B",
      focus: true,
    },
    {
      resultNames: ["E"],
      action: "mkIntersections",
      args: ["CD", "AB"],
      description: "Find the intersection point of AB and CD",
      focus: true,
    },
  ],
};

export const EquilateralTriangle: ConstructionDescription = {
  name: "equilateraltriangle",
  inputs: ["Point", "Point"],
  // TODO: maybe add initial positions for consistency? or a set seed
  initSteps: [
    {
      resultNames: ["A"],
      action: "mkPoint",
      args: [],
      focus: true,
    },
    {
      resultNames: ["B"],
      action: "mkPoint",
      args: [],
      focus: true,
    },
  ],
  steps: [
    {
      resultNames: ["CircAB"],
      action: "mkCircle",
      args: ["A", "B"],
      description:
        "Construct a circle with center A and and B on the circumference",
    },
    {
      resultNames: ["CircBA"],
      action: "mkCircle",
      args: ["B", "A"],
      description:
        "Construct a circle with center B and and A on the circumference",
    },
    {
      resultNames: ["C", "D"],
      action: "mkIntersections",
      args: ["CircAB", "CircBA"],
      description: "Find the intersection points of the two circles",
    },
    {
      resultNames: ["AC"],
      action: "mkSegment",
      args: ["A", "C"],
      description: "Construct a line between A and C",
      focus: true,
    },
    {
      resultNames: ["BC"],
      action: "mkSegment",
      args: ["B", "C"],
      description: "Construct a line between B and C",
      focus: true,
    },
    {
      resultNames: ["AB"],
      action: "mkSegment",
      args: ["A", "B"],
      description: "Construct a line between A and B",
      focus: true,
    },
  ],
};
export const walkthroughs: ConstructionDescription[] = [
  Midpoint,
  EquilateralTriangle,
];
