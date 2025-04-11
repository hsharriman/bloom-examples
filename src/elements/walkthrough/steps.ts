import { ConstructionDescription } from "../ElementsPage.js";
import {
  circleStep,
  collinearStep,
  copySegmentOnSegmentStep,
  copySegmentStep,
  cutLengthStep,
  equalSegmentStep,
  equilateralTriangleStep,
  horizontalSegmentStep,
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
  id: 1,
  // TODO: maybe add initial positions for consistency? or a set seed
  initSteps: [pointStep("A", [60, 50]), pointStep("B", [-60, 50])],
  seed: "3045ee4h",
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
  ],
};

export const EquilateralTriangle: ConstructionDescription = {
  name: "Prop 1: equilateral triangle",
  seed: "23j9da50",
  id: 2,
  initSteps: [pointStep("F"), pointStep("G"), horizontalSegmentStep("F", "G")],
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
  ],
};

const CopySegment: ConstructionDescription = {
  name: "Prop 2: copy segment",
  id: 3,
  // seed: Math.random().toString(20).substring(2, 10),
  seed: "fg2ja313",
  initSteps: [
    pointStep("A"),
    pointStep("B"),
    pointStep("C"),
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
  seed: "ieh1ha1f",
  id: 4,
  initSteps: [
    pointStep("A"),
    pointStep("B"),
    horizontalSegmentStep("A", "B"),
    pointStep("C"),
    pointStep("D"),
    horizontalSegmentStep("C", "D"),
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
  ],
};

const Isosceles: ConstructionDescription = {
  name: "Prop 5: Isosceles base angles are equal",
  seed: "0g6770jd",
  id: 5,
  initSteps: [
    pointStep("A"),
    pointStep("B"),
    pointStep("C"),
    segmentStep("A", "B", true),
    equalSegmentStep("AB", "A", "C"),
    horizontalSegmentStep("B", "C"),
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
  seed: Math.random().toString(20).substring(2, 10),
  id: 6,
  initSteps: [
    pointStep("A"),
    pointStep("B"),
    pointStep("C"),
    pointStep("D"),
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
  seed: "a0i48b7e",
  id: 6,
  initSteps: [
    pointStep("A"),
    pointStep("B"),
    pointStep("C"),
    segmentStep("A", "B"),
    segmentStep("A", "C"),
    // equalSegmentStep("AB", "A", "C"),
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
  seed: "83h16161",
  id: 7,
  initSteps: [pointStep("A"), pointStep("B"), horizontalSegmentStep("A", "B")],
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
  seed: "g62b24eb",
  id: 8,
  initSteps: [pointStep("A"), pointStep("B"), horizontalSegmentStep("A", "B")],
  steps: [
    {
      resultNames: ["C"],
      action: "mkBisectSegment",
      args: ["A", "B"],
      description: "Bisect the segment AB",
    },
    equilateralTriangleStep("A", "B", "D"),
    segmentStep("C", "D"),
  ],
};

const AngleOnLineMakes180: ConstructionDescription = {
  name: "Prop 13: Angle on one side of straight line makes two perpendicular angles",
  seed: "e7fie9ba",
  id: 9,
  initSteps: [pointStep("D"), pointStep("C"), horizontalSegmentStep("D", "C")],
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
  seed: "ab407ab7",
  id: 10,
  initSteps: [
    pointStep("A"),
    pointStep("B"),
    pointStep("D"),
    pointStep("C"),
    horizontalSegmentStep("D", "C"),
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
  seed: "429gibde",
  id: 11,
  initSteps: [
    pointStep("A"),
    pointStep("B"),
    pointStep("C"),
    triangleStep("A", "B", "C"),
  ],
  steps: [
    lineExtensionStep("BC", "D"),
    {
      resultNames: ["E"],
      action: "mkBisectSegment",
      args: ["A", "C"],
      description: "Bisect the segment AC",
    },
    segmentStep("B", "E"), // extra step to make it look like the example
    lineExtensionStep("AE", "F"), // extra step
    {
      resultNames: ["E"],
      action: "mkBisectSegment",
      args: ["B", "F"],
      description: "Bisect the segment AC",
    },
    segmentStep("F", "C"), // TODO?
  ],
};

const TriangleFromSegments: ConstructionDescription = {
  name: "Prop 22: Draw a triangle from three segments",
  seed: "9geah3b8",
  id: 12,
  initSteps: [
    pointStep("A"),
    pointStep("B"),
    pointStep("C"),
    pointStep("D"),
    pointStep("E"),
    pointStep("F"),
    horizontalSegmentStep("A", "B"),
    horizontalSegmentStep("C", "D"),
    horizontalSegmentStep("E", "F"),
  ],
  steps: [
    pointStep("G"),
    pointStep("H"),
    segmentStep("G", "H"),
    copySegmentOnSegmentStep("AB", "G", "H", "I"),
    copySegmentOnSegmentStep("CD", "I", "H", "J"),
    copySegmentOnSegmentStep("EF", "J", "H", "K"),
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
  seed: "20if94i5",
  id: 13,
  initSteps: [
    pointStep("A"),
    pointStep("B"),
    pointStep("C"),
    segmentStep("A", "B"),
    segmentStep("A", "C"),
  ],
  steps: [segmentStep("B", "C"), triangleFromSegmentStep("AB", "AC", "BC")],
};

const ParallelToEachOther: ConstructionDescription = {
  name: "Prop 30: Lines that are parallel to same line are parallel to each other",
  seed: Math.random().toString(20).substring(2, 10),
  id: 14,
  initSteps: [
    pointStep("A"),
    pointStep("B"),
    pointStep("C"),
    pointStep("D"),
    pointStep("E"),
    pointStep("F"),
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
    pointStep("A"),
    pointStep("B"),
    pointStep("C"),
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
    pointStep("A"),
    pointStep("B"),
    pointStep("C"),
    triangleStep("A", "B", "C"),
  ],
  steps: [lineExtensionStep("BC", "D"), parallelStep("AB", "C", "E")],
};

const TriangleArea: ConstructionDescription = {
  name: "Prop 37: Triangles with same base and height have equal area",
  // inputs: ["Point", "Point", "Point", "Segment", "Segment", "Segment"],
  id: 17,
  initSteps: [
    pointStep("A"),
    pointStep("B"),
    pointStep("C"),
    pointStep("D"),
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
  seed: "381a9bbh",
  // seed: Math.random().toString(20).substring(2, 10),
  id: 18,
  initSteps: [pointStep("A"), pointStep("B"), horizontalSegmentStep("A", "B")],
  steps: [
    perpendicularStep("AB", "A", "C"),
    copySegmentOnSegmentStep("AB", "A", "C", "D"),
    parallelStep("AC", "B", "E"),
    parallelStepBwPoints("AB", "D", "E"),
  ],
};

export const walkthroughs: ConstructionDescription[] = [
  // Midpoint,
  EquilateralTriangle,
  // CopySegment, // brittle
  CutGivenLen,
  // Isosceles, // brittle
  // SSS,
  // BisectAngle, // brittle
  // BisectSegment, // brittle
  Perpendicular,
  // AngleOnLineMakes180, // brittle
  // AnglesMakeStraightLine, // boring construction
  // TriangleExternalAngle, // brittle
  // TriangleFromSegments, // too big
  MoveAngle,
  // ParallelToEachOther, // parallel doesn't work
  // ParallelThruPoint,
  // TriangleAngleSum,
  // TriangleArea,
  Square,
];
