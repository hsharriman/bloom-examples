import { ConstructionDescription } from "../ElementsPage.js";
import {
  circleStep,
  equalSegmentStep,
  lineExtensionStep,
  pointStep,
  segmentStep,
} from "./templates.js";

export const Midpoint: ConstructionDescription = {
  name: "bisector",
  inputs: ["Point", "Point"],
  id: 1,
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
  id: 2,
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
    segmentStep("F", "G", true),
  ],
};

const CopySegment: ConstructionDescription = {
  name: "Prop 2: copy segment",
  id: 3,
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
    lineExtensionStep("DA", "E"),
    lineExtensionStep("DB", "F"),
    circleStep("B", "C"),
    {
      resultNames: ["G"],
      action: "mkIntersections",
      args: ["CircBC", "BF"],
      description: "Find the intersection points of the circle and line BF",
    },
    circleStep("D", "G"),
    {
      resultNames: ["L"],
      action: "mkIntersections",
      args: ["CircDG", "AE"], // TODO EF?
      description: "Find the intersection points of the circle and line AE",
      focus: true,
    },
    segmentStep("A", "L", true),
  ],
};

const CutGivenLen: ConstructionDescription = {
  name: "Prop 3: Cut Given Length",
  inputs: ["Point", "Point"],
  id: 4,
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
      resultNames: ["AE", "E"],
      action: "mkCopySegment",
      args: ["CD", "A"],
      description: "Copy the segment CD to point A",
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
  inputs: ["Point", "Point", "Point"],
  id: 5,
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("C", false),
    segmentStep("A", "B", true),
    segmentStep("A", "C", true),
    equalSegmentStep("AB", "AC"),
    segmentStep("B", "C"),
  ],
  steps: [
    lineExtensionStep("AB", "D"),
    lineExtensionStep("AC", "E"),
    {
      resultNames: ["F", "AF"],
      action: "mkCutGivenLen",
      args: ["BD", "B"],
      description: "Cut BD to length BF",
    },
    {
      resultNames: ["G", "AG"],
      action: "mkCutGivenLen",
      args: ["CE", "C"],
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
