import { Diagram, Renderer } from "@penrose/bloom";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { ActionButton } from "./components/ActionButton.tsx";
import { Construction, canvasWidth } from "./euclid.ts";
import {
  CObj,
  ConstructionAction,
  ConstructionElement,
  Point,
  Segment,
} from "./types.ts";
import { walkthroughs } from "./walkthrough/steps.ts";

// TODO: add optional labels to results
export interface ConstructionStep {
  resultNames: string[]; // names of results (usually singleton)
  action: ConstructionAction;
  args: string[]; // names of input elements
  description?: string;
  coords?: [number, number];
  focus?: boolean;
}

export interface ConstructionDescription {
  name: string;
  seed?: string;
  initSteps: ConstructionStep[]; // only for walkthrough
  steps: ConstructionStep[];
  id: number;
}

let construction = new Construction("");
let nameElementMap = new Map<string, ConstructionElement>();

export default function ElementsWalkthrough(props: {
  walkthroughName: string;
}) {
  const findDescription = (name: string) => {
    const description = walkthroughs.find((desc) => desc.name === name);
    if (!description) {
      throw new Error(`No construction description found for ${name}`);
    }
    return description;
  };

  const [description, setDescription] = useState<ConstructionDescription>(
    findDescription(props.walkthroughName)
  );
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [currAction, setCurrAction] = useState<ConstructionAction | null>(null);
  const [cleanupAction, setCleanupAction] = useState<() => void>(
    () => () => {}
  );
  const [currStepIdx, setCurrStepIdx] = useState(0);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDescription(findDescription(props.walkthroughName));
  }, [props.walkthroughName]);

  useEffect(() => {
    const escListener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cleanupAction();
        setCurrAction(null);
      }
    };

    window.addEventListener("keydown", escListener);

    return () => {
      window.removeEventListener("keydown", escListener);
    };
  }, [cleanupAction]);

  // setup
  useEffect(() => {
    for (const step of description.initSteps) {
      let obj: ConstructionElement | ConstructionElement[] = [];
      switch (step.action) {
        case "mkPoint":
          const coords = step.coords || [];
          obj = construction.mkPoint({
            label: step.resultNames[0],
            focus: step.focus,
            x: coords[0],
            y: coords[1],
            draggable: true,
          });
          break;
        case "mkSegment":
          obj = construction.mkSegment(
            nameElementMap.get(step.args[0]) as Point,
            nameElementMap.get(step.args[1]) as Point,
            undefined,
            // step.resultNames[0],
            step.focus
          );
          break;
        case "mkCircle":
          obj = construction.mkCircle(
            nameElementMap.get(step.args[0]) as Point,
            nameElementMap.get(step.args[1]) as Point,
            step.resultNames[0],
            step.focus
          );
          break;
        case "mkEquilateralTriangle":
          obj = construction.mkEquilateralTriangle(
            nameElementMap.get(step.args[0]) as Point,
            nameElementMap.get(step.args[1]) as Point,
            step.focus
          );
          break;
        case "mkIntersections":
          obj = construction.mkIntersections(
            nameElementMap.get(step.args[0]) as ConstructionElement,
            nameElementMap.get(step.args[1]) as ConstructionElement,
            step.focus
          );
          break;
        case "mkEqualSegment":
          obj = construction.mkEqualSegment(
            nameElementMap.get(step.args[0]) as Segment,
            nameElementMap.get(step.args[1]) as Point,
            nameElementMap.get(step.args[2]) as Point
          );
          break;
        case "mkLineExtension":
          obj = construction.mkLineExtension(
            [
              nameElementMap.get(step.args[0]) as Point,
              nameElementMap.get(step.args[1]) as Point,
            ],
            step.focus
          );
          break;
        case "mkCutGivenLen":
          obj = construction.mkCutGivenLen(
            nameElementMap.get(step.args[0]) as Point,
            nameElementMap.get(step.args[1]) as Point,
            step.focus
          );
          break;
        case "mkHorizontalSegment":
          obj = construction.mkHorizontalSegment(
            nameElementMap.get(step.args[0]) as Point,
            nameElementMap.get(step.args[1]) as Point
          );
          break;
        case "mkCollinear":
          obj = construction.mkCollinear(
            nameElementMap.get(step.args[0]) as Segment,
            nameElementMap.get(step.args[1]) as Point
          );
          break;
        case "mkBisectSegment":
          obj = construction.mkBisectSegment(
            nameElementMap.get(step.args[0]) as Point,
            nameElementMap.get(step.args[1]) as Point
          );
          break;
        case "mkLinesParallel":
          obj = construction.mkLinesParallel(
            nameElementMap.get(step.args[0]) as Segment,
            nameElementMap.get(step.args[1]) as Segment
          );
          break;
        case "mkPerpendicularLine":
          obj = construction.mkPerpendicularLine(
            nameElementMap.get(step.args[0]) as Segment,
            nameElementMap.get(step.args[1]) as Point
          );
          break;
        case "mkCopySegmentToSegment":
          obj = construction.mkCopySegmentToSegment(
            nameElementMap.get(step.args[0]) as Segment,
            nameElementMap.get(step.args[1]) as Point,
            nameElementMap.get(step.args[2]) as Point
          );
          break;
        case "mkTriangle":
          obj = construction.mkTriangle(
            nameElementMap.get(step.args[0]) as Point,
            nameElementMap.get(step.args[1]) as Point,
            nameElementMap.get(step.args[2]) as Point,
            step.focus
          );
          break;
        case "mkTriangleFromSegments":
          obj = construction.mkTriangleFromSegments(
            nameElementMap.get(step.args[0]) as Segment,
            nameElementMap.get(step.args[1]) as Segment,
            nameElementMap.get(step.args[2]) as Segment
          );
          break;
        case "mkCopyAngle":
          obj = construction.mkCopyAngle(
            nameElementMap.get(step.args[0]) as Point,
            nameElementMap.get(step.args[1]) as Point,
            nameElementMap.get(step.args[2]) as Point,
            nameElementMap.get(step.args[3]) as Point
          );
          break;
        case "mkParallelLine":
          obj = construction.mkParallelLine(
            nameElementMap.get(step.args[0]) as Segment,
            nameElementMap.get(step.args[1]) as Point
          );
          break;
        case "mkParallelLineBwPoints":
          obj = construction.mkParallelLineBwPoints(
            nameElementMap.get(step.args[0]) as Segment,
            nameElementMap.get(step.args[1]) as Point,
            nameElementMap.get(step.args[2]) as Point
          );
          break;
        default:
          console.error("Unexpected action: ", step.action);
          break;
      }

      // construction actions may return a single element, or an array
      if (obj instanceof Array) {
        obj.map((result, i) => nameElementMap.set(step.resultNames[i], result));
      } else {
        nameElementMap.set(step.resultNames[0], obj);
      }
    }

    construction.build().then(setDiagram);
    console.log("seed", description.seed);

    // if the walkthrough changes, start over
    return () => {
      construction = new Construction(description.seed);
      nameElementMap = new Map();
    };
  }, [description]);

  const checkAction = (
    action: ConstructionAction,
    args: ConstructionElement[]
  ): [boolean, string] => {
    const correctStep = description.steps[currStepIdx];
    if (action != correctStep.action)
      return [
        false,
        `action doesn't match: ${action}, correct: ${correctStep.action}`,
      ];

    const elementNameMap = new Map<ConstructionElement, string>();
    nameElementMap.forEach((v, k) => elementNameMap.set(v, k));

    const argNames = args.map((arg) => {
      const name = elementNameMap.get(arg);
      if (!name) throw new Error(`Element ${arg} not found in nameElementMap`);
      return name;
    });

    switch (action) {
      case "mkPoint":
        return [true, ""];

      case "mkSegment":
      // case "mkLine":
      case "mkEquilateralTriangle":
      case "mkTriangle":
      case "mkTriangleFromSegments":
      case "mkLinesParallel":
      case "mkBisectSegment":
      case "mkHorizontalSegment":
      case "mkIntersections":
        return [
          (argNames[0] === correctStep.args[0] &&
            argNames[1] === correctStep.args[1]) ||
            (argNames[0] === correctStep.args[1] &&
              argNames[1] === correctStep.args[0]),
          `order doesn't matter: ${argNames}, correct: ${correctStep.args}`,
        ];
      case "mkLineExtension":
      case "mkCircle":
      case "mkCopySegment":
      case "mkCollinear":
      case "mkPerpendicularLine":
      case "mkCutGivenLen":
        return [
          argNames[0] === correctStep.args[0] &&
            argNames[1] === correctStep.args[1],
          `order matters: ${argNames}, correct: ${correctStep.args}`,
        ];
      case "mkBisectAngle":
      case "mkParallelLine":
      case "mkParallelLineBwPoints":
      case "mkCopySegmentToSegment":
        return [
          argNames[0] === correctStep.args[0] &&
            argNames[1] === correctStep.args[1] &&
            argNames[2] === correctStep.args[2],
          `order matters: ${argNames}, correct: ${correctStep.args}`,
        ];
      case "mkEqualSegment":
        return [
          argNames[0] === correctStep.args[0] &&
            ((argNames[1] === correctStep.args[1] &&
              argNames[2] === correctStep.args[2]) ||
              (argNames[2] === correctStep.args[1] &&
                argNames[1] === correctStep.args[2])),
          `first obj must be segment, second 2 are points: ${argNames}, correct: ${correctStep.args}`,
        ];
      case "mkCopyAngle":
        return [
          argNames[0] === correctStep.args[0] &&
            argNames[1] === correctStep.args[1] &&
            argNames[2] === correctStep.args[2] &&
            argNames[3] === correctStep.args[3],
          `order matters: ${argNames}, correct: ${correctStep.args}`,
        ];
    }
  };

  const addPointOnClick = async () => {
    if (!canvasRef.current) return;

    const handler = async (e: PointerEvent) => {
      if (!canvasRef.current) return;
      if (!checkAction("mkPoint", [])) {
        alert("bad!");
        cleanup();
        setCurrAction(null);
        return;
      }
      const canvas = canvasRef.current;
      const bbox = canvas.getBoundingClientRect();
      const x = ((e.clientX - bbox.left) / bbox.width - 0.5) * canvasWidth;
      const y = -((e.clientY - bbox.top) / bbox.height - 0.5) * canvasWidth;

      const p = construction.mkPoint({
        x,
        y,
        label: description.steps[currStepIdx].resultNames[0],
        focus: description.steps[currStepIdx].focus,
        draggable: true,
      });
      nameElementMap.set(description.steps[currStepIdx].resultNames[0], p);

      cleanup();
      setCurrAction(null);
      setCurrStepIdx((i) => i + 1);
    };

    canvasRef.current.addEventListener("pointerdown", handler);

    const cleanup = () => {
      canvasRef.current?.removeEventListener("pointerdown", handler);
      construction.build(diagram!).then(setDiagram);
    };
    setCleanupAction(() => cleanup);

    setDiagram(await construction.build(diagram!));
    setCurrAction("mkPoint");
  };

  const setupSelect2Action = async (
    validTags: string[],
    finishAction: (selected: ConstructionElement[]) => void
  ) => {
    const selected: ConstructionElement[] = [];
    const handlers: Map<ConstructionElement, any> = new Map();
    for (const el of construction.elements) {
      if (!new Set(validTags).has(el.tag)) continue;
      const handler = async () => {
        construction.setSelected(el, true);
        if (
          selected.length < description.steps[currStepIdx].args.length &&
          (selected.length === 0 || selected[0] !== el)
        ) {
          selected.push(el);
          setDiagram(await construction.build(diagram!, true));
        }

        if (selected.length === description.steps[currStepIdx].args.length) {
          finishAction(selected);
          cleanup();
          setCurrAction(null);
        }
      };
      construction.db.addEventListener(el.icon, "pointerdown", handler);
      handlers.set(el, handler);
    }

    const cleanup = () => {
      for (const [el, handler] of handlers) {
        construction.db.removeEventListener(el.icon, "pointerdown", handler);
      }
      for (const el of selected) {
        construction.setSelected(el, false);
      }
      construction.build(diagram!).then(setDiagram!);
    };
    setCleanupAction(() => cleanup);
    setDiagram(await construction.build(diagram!, true));
  };

  const addSegmentOnClick = () => {
    addAction("mkSegment", [CObj.Point], ([A, B]) =>
      construction.mkSegment(
        A as Point,
        B as Point,
        undefined,
        description.steps[currStepIdx].focus
      )
    );
  };

  // const addLineOnClick = () => {
  //   addAction("mkLine", [CObj.Point], ([A, B]) =>
  //     construction.mkLine(
  //       A as Point,
  //       B as Point,
  //       undefined,
  //       description.steps[currStepIdx].focus
  //     )
  //   );
  // };

  const addCircleOnClick = () => {
    addAction("mkCircle", [CObj.Point], ([A, B]) =>
      construction.mkCircle(
        A as Point,
        B as Point,
        undefined,
        description.steps[currStepIdx].focus
      )
    );
  };

  const addEquilatOnClick = () => {
    addAction("mkEquilateralTriangle", [CObj.Point], ([A, B]) =>
      construction.mkEquilateralTriangle(
        A as Point,
        B as Point,
        description.steps[currStepIdx].focus
      )
    );
  };

  const addLineExtensionOnClick = () => {
    addAction("mkLineExtension", [CObj.Point], ([A, B]) =>
      construction.mkLineExtension(
        [A as Point, B as Point],
        description.steps[currStepIdx].focus
      )
    );
  };

  const addIntersectionsOnClick = () => {
    addAction("mkIntersections", [CObj.Segment, CObj.Circle], ([A, B]) =>
      construction.mkIntersections(A, B, description.steps[currStepIdx].focus)
    );
  };

  const addCopySegmentOnClick = () => {
    addAction("mkCopySegment", [CObj.Segment, CObj.Point], ([A, B]) =>
      construction.mkCopySegment(A as Segment, B as Point)
    );
  };

  const addCutSegmentOnClick = () => {
    addAction(
      "mkCutGivenLen",
      [CObj.Segment, CObj.Point],
      ([A, B]: ConstructionElement[]) =>
        construction.mkCutGivenLen(
          A as Point,
          B as Point,
          description.steps[currStepIdx].focus
        )
    );
  };

  const addBisectAngleOnClick = () => {
    addAction(
      "mkBisectAngle",
      [CObj.Point],
      ([A, B, C]: ConstructionElement[]) =>
        construction.mkBisectAngle(A as Point, B as Point, C as Point)
    );
  };

  const addCollinearOnClick = () => {
    addAction(
      "mkCollinear",
      [CObj.Point, CObj.Segment],
      ([A, B]: ConstructionElement[]) =>
        construction.mkCollinear(A as Segment, B as Point)
    );
  };
  const addBisectSegmentOnClick = () => {
    addAction(
      "mkBisectSegment",
      [CObj.Segment, CObj.Point],
      ([A, B]: ConstructionElement[]) =>
        construction.mkBisectSegment(A as Point, B as Point)
    );
  };

  const addPerpendicularOnClick = () => {
    addAction(
      "mkPerpendicularLine",
      [CObj.Segment, CObj.Point],
      ([A, B]: ConstructionElement[]) =>
        construction.mkPerpendicularLine(A as Segment, B as Point)
    );
  };

  const addTriangleOnClick = () => {
    addAction("mkTriangle", [CObj.Point], ([A, B, C]: ConstructionElement[]) =>
      construction.mkTriangle(A as Point, B as Point, C as Point)
    );
  };

  const addTriangleFromSegmentsOnClick = () => {
    addAction(
      "mkTriangleFromSegments",
      [CObj.Segment],
      ([A, B, C]: ConstructionElement[]) =>
        construction.mkTriangleFromSegments(
          A as Segment,
          B as Segment,
          C as Segment
        )
    );
  };

  const addCopySegmentToSegmentOnClick = () => {
    addAction(
      "mkCopySegmentToSegment",
      [CObj.Segment, CObj.Point],
      ([A, B, C]: ConstructionElement[]) =>
        construction.mkCopySegmentToSegment(
          A as Segment,
          B as Point,
          C as Point
        )
    );
  };

  // TODO
  const addMakeLinesParallel = () => {
    addAction(
      "mkParallelLine",
      [CObj.Segment, CObj.Point],
      ([A, B]: ConstructionElement[]) =>
        construction.mkParallelLine(A as Segment, B as Point)
    );
  };

  const addMakeParallelLineBwPoints = () => {
    addAction(
      "mkParallelLineBwPoints",
      [CObj.Segment, CObj.Point],
      ([A, B, C]: ConstructionElement[]) =>
        construction.mkParallelLineBwPoints(
          A as Segment,
          B as Point,
          C as Point
        )
    );
  };

  const addCopyAngle = () => {
    addAction(
      "mkCopyAngle",
      [CObj.Point],
      ([A, B, C, D]: ConstructionElement[]) =>
        construction.mkCopyAngle(A as Point, B as Point, C as Point, D as Point)
    );
  };

  const addAction = (
    methodName: SetStateAction<ConstructionAction | null>,
    args: CObj[],
    fn: (
      args: ConstructionElement[]
    ) => ConstructionElement[] | ConstructionElement
  ) => {
    setCurrAction(methodName);
    setupSelect2Action(args, (selected) => {
      const [valid, msg] = checkAction(
        methodName as ConstructionAction,
        selected
      );
      if (!valid) {
        alert(msg);
        return;
      }
      const objs = fn(selected);
      if (objs instanceof Array) {
        objs.map((obj, i) =>
          nameElementMap.set(description.steps[currStepIdx].resultNames[i], obj)
        );
      } else {
        nameElementMap.set(description.steps[currStepIdx].resultNames[0], objs);
      }

      setCurrStepIdx((i) => i + 1);
    });
  };

  return (
    <>
      {/* Place the following buttons in a div that looks nice*/}
      <div className="py-8 px-12 flex flex-row w-full gap-8 ">
        <div className="flex flex-col max-w-[450px]">
          <div className="flex flex-col bg-blue-200 px-4 py-4 pb-6 rounded-3xl shadow-lg">
            <div className="font-bold text-black text-2xl">
              Next Step Instructions
            </div>
            <div className="italic">Press ESC to cancel action</div>
            {renderStepInstructions(currStepIdx, description)}
          </div>
          <div className="font-bold text-black text-2xl pb-2 pt-4">
            Construction Actions
          </div>
          <div className="flex flex-col">
            <div className="text-black font-mono font-bold text-lg">
              Basic Object Actions
            </div>
            <div className="flex flex-row flex-wrap gap-x-4">
              {ActionButton(
                "Add Point",
                currAction !== null,
                addPointOnClick,
                true
              )}
              {ActionButton(
                "Add Segment",
                currAction !== null,
                addSegmentOnClick,
                true
              )}
              {/* {ActionButton(
              "Add Line",
              currAction !== null,
              addLineOnClick,
              true
            )} */}
              {ActionButton(
                "Add Circle",
                currAction !== null,
                addCircleOnClick,
                true
              )}
              {ActionButton(
                "Add Intersections",
                currAction !== null,
                addIntersectionsOnClick,
                true
              )}
              {ActionButton(
                "Add Collinear Point",
                currAction !== null,
                addCollinearOnClick,
                description.id > 6
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-black font-mono font-bold text-lg">
              Segment / Line Actions
            </div>
            <div className="flex flex-row flex-wrap gap-x-4">
              {ActionButton(
                "Extend Line",
                currAction !== null,
                addLineExtensionOnClick,
                description.id > 2
              )}
              {ActionButton(
                "Copy Segment",
                currAction !== null,
                addCopySegmentOnClick,
                description.id > 3
              )}
              {ActionButton(
                "Cut Length",
                currAction !== null,
                addCutSegmentOnClick,
                description.id > 4
              )}
              {ActionButton(
                "Bisect Segment",
                currAction !== null,
                addBisectSegmentOnClick,
                description.id > 7
              )}
              {ActionButton(
                "Make Perpendicular Line",
                currAction !== null,
                addPerpendicularOnClick,
                description.id > 8
              )}
              {ActionButton(
                "Copy segment onto a segment",
                currAction !== null,
                addCopySegmentToSegmentOnClick,
                description.id > 11
              )}
              {ActionButton(
                "Make a parallel segment",
                currAction !== null,
                addMakeLinesParallel,
                description.id > 15 // TODO: update this
              )}
              {ActionButton(
                "Make a parallel segment between two points",
                currAction !== null,
                addMakeParallelLineBwPoints,
                description.id > 16
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-black font-mono font-bold text-lg">
              Angle Actions
            </div>
            <div className="flex flex-row flex-wrap gap-x-4">
              {ActionButton(
                "Bisect Angle",
                currAction !== null,
                addBisectAngleOnClick,
                description.id > 6
              )}
              {ActionButton(
                "Copy Angle to a point",
                currAction !== null,
                addCopyAngle,
                description.id > 14
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-black font-mono font-bold text-lg">
              Triangle Actions
            </div>
            <div className="flex flex-row flex-wrap gap-x-4">
              {ActionButton(
                "Add Equilateral Triangle",
                currAction !== null,
                addEquilatOnClick,
                description.id > 2
              )}

              {ActionButton(
                "Add Triangle",
                currAction !== null,
                addTriangleOnClick,
                description.id > 9
              )}

              {ActionButton(
                "Copy Triangle from 3 segments",
                currAction !== null,
                addTriangleFromSegmentsOnClick,
                description.id > 12
              )}
            </div>
          </div>
          <div className="max-h-[600px] flex flex-col flex-wrap gap-x-4"></div>
        </div>

        <div
          className="border-2 border-black w-[50rem] h-[50rem] rounded-md"
          ref={canvasRef}
        >
          <Renderer diagram={diagram} />
        </div>
      </div>
    </>
  );
}

const renderStepInstructions = (
  currIdx: number,
  description: ConstructionDescription
) => {
  return (
    <div className="font-xl text-black font-bold">
      {currIdx >= description.steps.length ? (
        "Construction complete!"
      ) : (
        <span>
          <span className="font-bold">{`Step ${currIdx + 1}: `}</span>
          {description.steps[currIdx].description}
        </span>
      )}
    </div>
  );
};
