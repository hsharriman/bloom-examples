import { ConstructionDescription } from "./elements-walkthrough.js";
import {
  circleStep,
  equalSegmentStep,
  lineExtensionStep,
  pointStep,
  segmentStep,
} from "./walkthrough-templates.js";

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
  name: "Prop 1: equilateral triangle",
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
  name: "Prop 2: copy segment",
  inputs: ["Point", "Point", "Point", "Segment"],
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("C", true),
    segmentStep("B", "C", true),
  ],
  steps: [
    {
      resultNames: ["ABD", "D", "AD", "AB", "BD"],
      action: "mkEquilateralTriangle",
      args: ["A", "B"],
      description: "Construct an equilateral triangle with side length AB",
    },
    {
      resultNames: ["DE", "E"],
      action: "mkLineExtension",
      args: ["D", "A"],
      description: "Extend the line AD",
    },
    {
      resultNames: ["DF", "F"],
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

const CutGivenLen: ConstructionDescription = {
  name: "Prop 3: Cut Given Length",
  inputs: ["Point", "Point"],
  // TODO: maybe add initial positions for consistency? or a set seed
  initSteps: [
    pointStep("A", false),
    pointStep("B", false),
    segmentStep("A", "B"),
    pointStep("C", false),
    pointStep("D", false),
    segmentStep("C", "D", true),
  ],
  steps: [
    {
      resultNames: ["E", "AE"],
      action: "mkEqualSegment",
      args: ["CD", "A"],
      description: "Copy the segment BC to point A",
    },
    circleStep("A", "E"),
    {
      resultNames: ["F"],
      action: "mkIntersections",
      args: ["CircAE", "AB"],
      description: "Find the intersection points of the circle and line",
      focus: true,
    },
    segmentStep("A", "F", true),
  ],
};

const Isosceles: ConstructionDescription = {
  name: "Prop 5: Isosceles base angles are equal",
  inputs: ["Point", "Point", "Point", "Triangle"],
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    segmentStep("A", "B", true),
    equalSegmentStep("AB", "A", "C"),
    segmentStep("B", "C"),
  ],
  steps: [
    lineExtensionStep("AB", "D"),
    lineExtensionStep("AC", "E"),
    {
      resultNames: ["F", "AF"],
      action: "mkCutGivenLen",
      args: ["AD"],
      description: "Cut BD to length BF",
    },
    {
      resultNames: ["G", "AG"],
      action: "mkCutGivenLen",
      args: ["AE"],
      description: "Cut CE to length CG",
    },
    segmentStep("B", "G"),
    segmentStep("C", "F"),
  ],
};

export const walkthroughs: ConstructionDescription[] = [
  Midpoint,
  EquilateralTriangle,
  CopySegment,
  CutGivenLen,
  Isosceles,
];
