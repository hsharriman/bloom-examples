import { Diagram, Renderer } from "@penrose/bloom";
import { useEffect, useRef, useState } from "react";
import { ActionButton } from "./components/ActionButton.tsx";
import { Construction, ConstructionAction, canvasWidth } from "./elements.ts";
import { ConstructionElement, Point } from "./types.ts";
import { walkthroughs } from "./walkthroughs.ts";

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
      // TODO why is this being called here before the nameElementMap is set up?
      const args: any = step.args.map((arg) => nameElementMap.get(arg)!);
      // @ts-expect-error Spreading args is illegal for unknown lengths
      const results = construction[step.action]({
        label: step.resultNames[0],
        focus: step.focus,
        draggable: true,
      });

      // construction actions may return a single element, or an array
      if (results instanceof Array) {
        results.map((result, i) =>
          nameElementMap.set(step.resultNames[i], result)
        );
      } else {
        nameElementMap.set(step.resultNames[0], results);
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
  ) => {
    const correctStep = description.steps[currStepIdx];
    if (action != correctStep.action) return false;

    const elementNameMap = new Map<ConstructionElement, string>();
    nameElementMap.forEach((v, k) => elementNameMap.set(v, k));

    const argNames = args.map((arg) => {
      const name = elementNameMap.get(arg);
      if (!name) throw new Error(`Element ${arg} not found in nameElementMap`);
      return name;
    });

    switch (action) {
      case "mkPoint":
        return true;

      case "mkSegment":
      case "mkLine":
      case "mkEquilateralTriangle":
      case "mkIntersections":
        return (
          (argNames[0] === correctStep.args[0] &&
            argNames[1] === correctStep.args[1]) ||
          (argNames[0] === correctStep.args[1] &&
            argNames[1] === correctStep.args[0])
        );
      case "mkLineExtension":
      case "mkCircle":
        return (
          argNames[0] === correctStep.args[0] &&
          argNames[1] === correctStep.args[1]
        );
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

  const setupSelect2Action = async <
    T extends ConstructionElement,
    U extends ConstructionElement
  >(
    validTags: string[],
    finishAction: (el1: T, el2: U) => void
  ) => {
    const selected: ConstructionElement[] = [];
    const handlers: Map<ConstructionElement, any> = new Map();
    for (const el of construction.elements) {
      if (!new Set(validTags).has(el.tag)) continue;
      const handler = async () => {
        construction.setSelected(el, true);

        if (
          selected.length < 2 &&
          (selected.length === 0 || selected[0] !== el)
        ) {
          selected.push(el);
          setDiagram(await construction.build(diagram!));
        }

        if (selected.length === 2) {
          const [A, B] = selected;
          finishAction(A as any, B as any);
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
        console.log(selected);
        construction.setSelected(el, false);
      }
      construction.build(diagram!).then(setDiagram!);
    };
    setCleanupAction(() => cleanup);
    setDiagram(await construction.build(diagram!));
  };

  const addSegmentOnClick = () => {
    setCurrAction("mkSegment");
    setupSelect2Action(["Point"], (A, B) => {
      if (!checkAction("mkSegment", [A, B])) {
        alert("bad!");
        return;
      }
      const s = construction.mkSegment(
        A as Point,
        B as Point,
        undefined,
        description.steps[currStepIdx].focus
      );
      nameElementMap.set(description.steps[currStepIdx].resultNames[0], s);
      setCurrStepIdx((i) => i + 1);
    });
  };

  const addLineOnClick = () => {
    setCurrAction("mkLine");
    setupSelect2Action(["Point"], (A, B) => {
      if (!checkAction("mkLine", [A, B])) {
        alert("bad!");
        return;
      }
      const l = construction.mkLine(
        A as Point,
        B as Point,
        undefined,
        description.steps[currStepIdx].focus
      );
      nameElementMap.set(description.steps[currStepIdx].resultNames[0], l);
      setCurrStepIdx((i) => i + 1);
    });
  };

  const addCircleOnClick = () => {
    setCurrAction("mkCircle");
    setupSelect2Action(["Point"], (A, B) => {
      if (!checkAction("mkCircle", [A, B])) {
        alert("bad!");
        return;
      }
      const c = construction.mkCircle(
        A as Point,
        B as Point,
        undefined,
        description.steps[currStepIdx].focus
      );
      nameElementMap.set(description.steps[currStepIdx].resultNames[0], c);
      setCurrStepIdx((i) => i + 1);
    });
  };

  const addEquilatOnClick = () => {
    setCurrAction("mkEquilateralTriangle");
    setupSelect2Action(["Point"], (A, B) => {
      if (!checkAction("mkEquilateralTriangle", [A, B])) {
        alert("bad!");
        return;
      }
      const results = construction.mkEquilateralTriangle(
        A as Point,
        B as Point,
        description.steps[currStepIdx].focus
      );
      results.forEach((obj, i) =>
        nameElementMap.set(description.steps[currStepIdx].resultNames[i], obj)
      );
      setCurrStepIdx((i) => i + 1);
    });
  };

  const addLineExtensionOnClick = () => {
    setCurrAction("mkLineExtension");
    setupSelect2Action(["Point"], (A, B) => {
      if (!checkAction("mkLineExtension", [A, B])) {
        alert("bad!");
        return;
      }
      const [seg, pt] = construction.mkLineExtension(
        [A as Point, B as Point],
        description.steps[currStepIdx].focus
      );
      nameElementMap.set(description.steps[currStepIdx].resultNames[0], seg);
      nameElementMap.set(description.steps[currStepIdx].resultNames[1], pt);
      setCurrStepIdx((i) => i + 1);
    });
  };

  const addIntersectionsOnClick = () => {
    setCurrAction("mkIntersections");
    setupSelect2Action(["Segment", "Circle"], (A, B) => {
      if (!checkAction("mkIntersections", [A, B])) {
        alert("bad!");
        return;
      }
      const [C, D] = construction.mkIntersections(
        A,
        B,
        description.steps[currStepIdx].focus
      );
      nameElementMap.set(description.steps[currStepIdx].resultNames[0], C);
      nameElementMap.set(description.steps[currStepIdx].resultNames[1], D);
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
