import { ConstructionDescription } from "./elements-walkthrough.js";

export const walkthroughs : ConstructionDescription[] = [
  {
    name: "bisector",
    inputs: ["Point", "Point"],
    initSteps: [
      {
        resultNames: ["A"],
        action: "mkPoint",
        args: [],
      },
      {
        resultNames: ["B"],
        action: "mkPoint",
        args: [],
      },
    ],
    steps: [
      {
        resultNames: ["CircAB"],
        action: "mkCircle",
        args: ["A", "B"],
        description: "Construct a circle with center A and and B on the circumference",
      },
      {
        resultNames: ["CircBA"],
        action: "mkCircle",
        args: ["B", "A"],
        description: "Construct a circle with center B and and A on the circumference",
      },
      {
        resultNames: ["C", "D"],
        action: "mkIntersections",
        args: ["CircAB", "CircBA"],
        description: "Find the intersection points of the two circles",
      },
      {
        resultNames: ["CD"],
        action: "mkLine",
        args: ["C", "D"],
        description: "Construct the line through C and D",
      }
    ],
  },
]