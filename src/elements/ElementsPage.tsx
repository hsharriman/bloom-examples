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
  focus?: boolean;
}

export interface ConstructionDescription {
  name: string;
  inputs: ConstructionElement["tag"][];
  initSteps: ConstructionStep[]; // only for walkthrough
  steps: ConstructionStep[];
  id: number;
}

let construction = new Construction();
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
          obj = construction.mkPoint({
            label: step.resultNames[0],
            focus: step.focus,
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
        case "mkLine":
          obj = construction.mkLine(
            nameElementMap.get(step.args[0]) as Point,
            nameElementMap.get(step.args[1]) as Point,
            step.resultNames[0],
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
            nameElementMap.get(step.args[1]) as Segment
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
            nameElementMap.get(step.args[0]) as Segment,
            nameElementMap.get(step.args[1]) as Point,
            step.focus
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

    // if the walkthrough changes, start over
    return () => {
      construction = new Construction();
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
      case "mkLine":
      case "mkEquilateralTriangle":
      case "mkEqualSegment":
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
      case "mkCutGivenLen":
        console.log("checking order matters ", argNames, correctStep.args);
        return [
          argNames[0] === correctStep.args[0] &&
            argNames[1] === correctStep.args[1],
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

      console.log(
        "mkpoint name",
        description.steps[currStepIdx].resultNames[0]
      );
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

  const addLineOnClick = () => {
    addAction("mkLine", [CObj.Point], ([A, B]) =>
      construction.mkLine(
        A as Point,
        B as Point,
        undefined,
        description.steps[currStepIdx].focus
      )
    );
  };

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
          A as Segment,
          B as Point,
          description.steps[currStepIdx].focus
        )
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
        console.log(nameElementMap);
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
          <div className="font-bold text-black text-2xl pb-2">
            Next Step Instructions
          </div>
          <div className="italic">Press ESC to cancel action</div>
          {renderStepInstructions(currStepIdx, description)}
          <div className="font-bold text-black text-2xl pb-2 pt-4">
            Construction Actions
          </div>
          {ActionButton("Add Point", currAction !== null, addPointOnClick)}
          {ActionButton("Add Segment", currAction !== null, addSegmentOnClick)}
          {ActionButton("Add Line", currAction !== null, addLineOnClick)}
          {ActionButton("Add Circle", currAction !== null, addCircleOnClick)}
          {ActionButton(
            "Add Intersections",
            currAction !== null,
            addIntersectionsOnClick
          )}
          {ActionButton(
            "Add Equilateral Triangle",
            currAction !== null,
            addEquilatOnClick
          )}
          {ActionButton(
            "Extend Line",
            currAction !== null,
            addLineExtensionOnClick
          )}
          {ActionButton(
            "Copy Segment",
            currAction !== null,
            addCopySegmentOnClick
          )}
          {ActionButton(
            "Cut Length",
            currAction !== null,
            addCutSegmentOnClick
          )}
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
    <div className="font-lg text-black">
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
