import { ConstructionDescription } from "./elements-walkthrough.js";
import { circleStep, pointStep, segmentStep } from "./walkthrough-templates.js";

export const Midpoint: ConstructionDescription = {
  name: "bisector",
  inputs: ["Point", "Point"],
  // TODO: maybe add initial positions for consistency? or a set seed
  initSteps: [pointStep("A", true), pointStep("B", true)],
  steps: [
    circleStep("A", "B"),
    circleStep("B", "A"),
    {
      resultNames: ["C", "D"],
      action: "mkIntersections",
      args: ["CircAB", "CircBA"],
      description: "Find the intersection points of the two circles",
    },
    segmentStep("C", "D"),
    segmentStep("A", "B", true),
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
  name: "equilateral triangle",
  inputs: ["Point", "Point"],
  initSteps: [pointStep("F", true), pointStep("G", true)],
  steps: [
    circleStep("F", "G"),
    circleStep("G", "F"),
    {
      resultNames: ["H", "I"],
      action: "mkIntersections",
      args: ["CircFG", "CircGF"],
      description: "Find the intersection points of the two circles",
    },
    segmentStep("F", "H", true),
    segmentStep("G", "H", true),
    segmentStep("F", "I", true),
  ],
};

const CopySegment: ConstructionDescription = {
  name: "copy segment",
  inputs: ["Point", "Point", "Point", "Segment"],
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("C", true),
    // segmentStep("B", "C", true), // TODO this breaks?
  ],
  steps: [
    segmentStep("B", "C", true),
    {
      resultNames: ["ABD", "D", "AD", "AB", "BD"],
      action: "mkEquilateralTriangle",
      args: ["A", "B"],
      description: "Construct an equilateral triangle with side length AB",
    },
    {
      resultNames: ["DE"],
      action: "mkLineExtension",
      args: ["A", "D"],
      description: "Extend the line AD",
    },
    {
      resultNames: ["DF"],
      action: "mkLineExtension",
      args: ["D", "B"],
      description: "Extend the line DB",
    },
    circleStep("B", "C"),
    {
      resultNames: ["G"],
      action: "mkIntersections",
      args: ["CircBC", "DF"],
      description: "Find the intersection points of the circle and line",
    },
    circleStep("D", "G"),
    {
      resultNames: ["L"],
      action: "mkIntersections",
      args: ["CircDG", "DE"], // TODO EF?
      description: "Find the intersection points of the circle and line",
      focus: true,
    },
    segmentStep("A", "L", true),
  ],
};

export const walkthroughs: ConstructionDescription[] = [
  Midpoint,
  EquilateralTriangle,
  CopySegment,
];
