import { ConstructionDescription } from "../ElementsPage.js";
import {
  circleStep,
  collinearStep,
  copySegmentOnSegmentStep,
  copySegmentStep,
  cutLengthStep,
  equalSegmentStep,
  equilateralTriangleStep,
  initLinesParallelStep,
  lineExtensionStep,
  moveAngleStep,
  parallelStep,
  parallelStepBwPoints,
  perpendicularStep,
  pointStep,
  segmentStep,
  triangleFromSegmentStep,
  triangleStep,
} from "./templates.js";

export const Midpoint: ConstructionDescription = {
  name: "bisector",
  // inputs: ["Point", "Point"],
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
  // inputs: ["Point", "Point"],
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
  // inputs: ["Point", "Point", "Point", "Segment"],
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
  // inputs: ["Point", "Point"],
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
    copySegmentStep("CD", "A", "E"),
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
  // inputs: ["Point", "Point", "Point"],
  id: 5,
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("C", false),
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

const SSS: ConstructionDescription = {
  name: "Prop 7: SSS Uniqueness",
  // inputs: ["Point", "Point", "Point", "Point"],
  id: 6,
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("C", false),
    pointStep("D", false),
    segmentStep("A", "B", true),
    segmentStep("A", "D", true),
    segmentStep("B", "D", true),
    equalSegmentStep("AD", "A", "C"),
    equalSegmentStep("BD", "B", "C"),
  ],
  steps: [segmentStep("C", "D")],
};

const BisectAngle: ConstructionDescription = {
  name: "Prop 9: Bisect angle",
  // inputs: ["Point", "Point", "Point"],
  id: 6,
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("C", false),
    segmentStep("A", "B"),
    equalSegmentStep("AB", "A", "C"),
  ],
  steps: [
    cutLengthStep("A", "B", "D"),
    cutLengthStep("A", "C", "E"),
    equilateralTriangleStep("D", "E", "F"),
    segmentStep("A", "F"),
  ],
};

const BisectSegment: ConstructionDescription = {
  name: "Prop 10: Bisect segment",
  // inputs: ["Point", "Point"],
  id: 7,
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    segmentStep("A", "B"),
  ],
  steps: [
    equilateralTriangleStep("A", "B", "C"),
    {
      resultNames: ["CD", "D"],
      action: "mkBisectAngle",
      args: ["A", "C", "B"],
      description: "Bisect angle ACB",
    },
    collinearStep("AB", "D"),
  ],
};

const Perpendicular: ConstructionDescription = {
  name: "Prop 11: Draw perpendicular",
  // inputs: ["Point", "Point", "Point", "Segment"],
  id: 8,
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("C", true),
    segmentStep("A", "B"),
    collinearStep("AB", "C"),
  ],
  steps: [
    {
      resultNames: ["AC", "CD"],
      action: "mkBisectSegment",
      args: ["AB", "C"],
      description: "Bisect the segment AB",
    },
    equilateralTriangleStep("A", "B", "D"),
    segmentStep("C", "D"),
  ],
};

const AngleOnLineMakes180: ConstructionDescription = {
  name: "Prop 13: Angle on one side of straight line makes two perpendicular angles",
  // inputs: ["Point", "Point", "Segment"],
  id: 9,
  initSteps: [
    pointStep("D", true),
    pointStep("C", true),
    segmentStep("D", "C"),
  ],
  steps: [
    pointStep("B"),
    collinearStep("DC", "B"),
    pointStep("A"),
    segmentStep("A", "B"),
    {
      resultNames: ["BE", "E"],
      action: "mkPerpendicularLine",
      args: ["DC", "B"],
      description: "Draw a line BE that is perpendicular to DC",
    },
  ],
};

// this one is weird because you draw a "parallel line" as if it is not parallel in the example.
const AnglesMakeStraightLine: ConstructionDescription = {
  name: "Prop 14: Sum of two angles one side of line makes a straight line",
  // inputs: ["Point", "Point", "Segment"],
  id: 10,
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("D", true),
    pointStep("C", true),
    segmentStep("D", "C"),
    segmentStep("A", "B"),
    collinearStep("DC", "B"),
  ],
  steps: [
    pointStep("E"),
    segmentStep("E", "B"),
    // TODO parallel line from point
  ],
};

const TriangleExternalAngle: ConstructionDescription = {
  name: "Prop 16: Triangle external angle is greater than each opposite internal angle",
  // inputs: ["Point", "Point", "Point", "Triangle"],
  id: 11,
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("D", true),
    triangleStep("A", "B", "C"),
  ],
  steps: [
    lineExtensionStep("BC", "D"),
    {
      resultNames: ["AE", "EC"],
      action: "mkBisectSegment",
      args: ["AC", "E"],
      description: "Bisect the segment AC",
    },
    segmentStep("B", "E"), // extra step to make it look like the example
    lineExtensionStep("AE", "F"), // extra step
    {
      resultNames: ["BE", "EF"],
      action: "mkBisectSegment",
      args: ["BF", "E"],
      description: "Bisect the segment AC",
    },
    segmentStep("F", "C"), // TODO?
  ],
};

const TriangleFromSegments: ConstructionDescription = {
  name: "Prop 22: Draw a triangle from three segments",
  // inputs: ["Point", "Point", "Point", "Segment", "Segment", "Segment"],
  id: 12,
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("C", true),
    pointStep("D", true),
    pointStep("E", true),
    pointStep("F", true),
    segmentStep("A", "B"),
    segmentStep("C", "D"),
    segmentStep("E", "F"),
  ],
  steps: [
    pointStep("G"),
    pointStep("H"),
    segmentStep("G", "H"),
    copySegmentOnSegmentStep("AB", "GH", "G", "I"),
    copySegmentOnSegmentStep("CD", "GH", "I", "J"),
    copySegmentOnSegmentStep("EF", "GH", "J", "K"),
    circleStep("I", "G"),
    circleStep("J", "K"),
    {
      resultNames: ["L"],
      action: "mkIntersections",
      args: ["CircIG", "CircJK"],
      description: "Find the intersection points of the two circles",
    },
    triangleStep("L", "I", "J"),
  ],
};

const MoveAngle: ConstructionDescription = {
  name: "Prop 23: Move angle",
  // inputs: ["Point", "Point", "Point", "Segment", "Segment", "Segment"],
  id: 13,
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("C", true),
    segmentStep("A", "B"),
    segmentStep("A", "C"),
  ],
  steps: [segmentStep("B", "C"), triangleFromSegmentStep("AB", "AC", "BC")],
};

const ParallelToEachOther: ConstructionDescription = {
  name: "Prop 30: Lines that are parallel to same line are parallel to each other",
  // inputs: ["Point", "Point", "Point", "Segment", "Segment", "Segment"],
  id: 14,
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("C", true),
    pointStep("D", true),
    pointStep("E", true),
    pointStep("F", true),
    segmentStep("A", "B"),
    segmentStep("C", "D"),
    segmentStep("E", "F"),
    initLinesParallelStep("AB", "EF"),
    initLinesParallelStep("CD", "EF"),
  ],
  steps: [
    pointStep("G"),
    pointStep("K"),
    pointStep("H"),
    collinearStep("AB", "G"),
    collinearStep("CD", "K"),
    collinearStep("EF", "H"),
    segmentStep("G", "K"),
    collinearStep("GK", "H"),
  ],
};

const ParallelThruPoint: ConstructionDescription = {
  name: "Prop 31: Draw parallel through point",
  // inputs: ["Point", "Point", "Point", "Segment", "Segment", "Segment"],
  id: 15,
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("C", true),
    segmentStep("B", "C"),
  ],
  steps: [
    pointStep("D"),
    collinearStep("BC", "D"),
    segmentStep("A", "D"),
    moveAngleStep("A", "D", "C", "A"),
  ],
};

const TriangleAngleSum: ConstructionDescription = {
  name: "Prop 32: Triangle Angles sums to two perpendicular angles",
  // inputs: ["Point", "Point", "Point", "Segment", "Segment", "Segment"],
  id: 16,
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("C", true),
    triangleStep("A", "B", "C"),
  ],
  steps: [lineExtensionStep("BC", "D"), parallelStep("AB", "C", "E")],
};

const TriangleArea: ConstructionDescription = {
  name: "Prop 37: Triangles with same base and height have equal area",
  // inputs: ["Point", "Point", "Point", "Segment", "Segment", "Segment"],
  id: 17,
  initSteps: [
    pointStep("A", true),
    pointStep("B", true),
    pointStep("C", true),
    pointStep("D", true),
    triangleStep("A", "B", "C"),
    triangleStep("B", "C", "D"),
    segmentStep("A", "D"),
    lineExtensionStep("AD", "E"),
    lineExtensionStep("DA", "F"),
    initLinesParallelStep("BC", "AD"),
  ],
  steps: [parallelStep("AC", "E", "B"), parallelStep("BD", "C", "F")],
};

const Square: ConstructionDescription = {
  name: "Prop 46: Draw a square",
  id: 18,
  initSteps: [pointStep("A"), pointStep("B"), segmentStep("A", "B")],
  steps: [
    perpendicularStep("AB", "A", "C"),
    copySegmentOnSegmentStep("AB", "AC", "A", "D"),
    parallelStep("AD", "B", "E"),
    parallelStepBwPoints("AB", "D", "E"),
  ],
};

export const walkthroughs: ConstructionDescription[] = [
  Midpoint,
  EquilateralTriangle,
  CopySegment,
  CutGivenLen,
  Isosceles,
  SSS,
  BisectAngle,
  BisectSegment,
  Perpendicular,
  AngleOnLineMakes180,
  AnglesMakeStraightLine,
  TriangleExternalAngle,
  TriangleFromSegments,
  MoveAngle,
  ParallelToEachOther,
  ParallelThruPoint,
  TriangleAngleSum,
  TriangleArea,
  Square,
];
