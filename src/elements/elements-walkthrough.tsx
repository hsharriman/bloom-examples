import {Diagram, Renderer} from "@penrose/bloom";
import {
  canvasWidth,
  Construction,
  ConstructionAction,
  ConstructionElement,
  Point
} from "./elements.js";
import {useEffect, useRef, useState} from "react";
import {walkthroughs} from "./walkthroughs.ts";

// TODO: add optional labels to results
interface ConstructionStep {
  resultNames: string[]; // names of results (usually singleton)
  action: ConstructionAction;
  args: string[]; // names of input elements
  description?: string;
}

export interface ConstructionDescription {
  name: string;
  inputs: ConstructionElement["tag"][];
  initSteps: ConstructionStep[]; // only for walkthrough
  steps: ConstructionStep[];
}

let construction = new Construction();
let nameElementMap = new Map<string, ConstructionElement>();

export default function ElementsWalkthrough(
  props: {
    walkthroughName: string;
  }
) {

  const findDescription = (name: string) => {
    const description = walkthroughs.find((desc) => desc.name === name);
    if (!description) {
      throw new Error(`No construction description found for ${name}`);
    }
    return description;
  };

  const [description, setDescription] = useState<ConstructionDescription>(findDescription(props.walkthroughName));
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [currAction, setCurrAction] = useState<
    | ConstructionAction
    | null
  >(null);
  const [cleanupAction, setCleanupAction] = useState<() => void>(() => () => {});
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
        const args: any = step.args.map((arg) => nameElementMap.get(arg)!);
        // @ts-expect-error Spreading args is illegal for unknown lengths
        const results = construction[step.action](...args);

        // construction actions may return a single element, or ayarnn array
        if (results instanceof Array) {
          results.map((result, i) => nameElementMap.set(step.resultNames[i], result));
        } else {
          nameElementMap.set(step.resultNames[0], results);
        }
      }

      construction.build().then(setDiagram);

      // if the walkthrough changes, start over
      return () => {
        construction = new Construction();
        nameElementMap = new Map();
      }
  }, [description]);

  const checkAction = (action: ConstructionAction, args: ConstructionElement[]) => {
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
      case "mkIntersections":
        return argNames[0] === correctStep.args[0] && argNames[1] === correctStep.args[1]
          || argNames[0] === correctStep.args[1] && argNames[1] === correctStep.args[0];

      case "mkCircle":
        return argNames[0] === correctStep.args[0] && argNames[1] === correctStep.args[1];
    }
  }

  const addPointOnClick = async () => {
    if (!canvasRef.current) return;

    const handler =  async (e: PointerEvent) => {
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

      const p = construction.mkPoint(x, y, undefined, true);
      nameElementMap.set(description.steps[currStepIdx].resultNames[0], p);

      cleanup();
      setCurrAction(null);
      setCurrStepIdx(i => i + 1);
    };

    canvasRef.current.addEventListener("pointerdown", handler);

    const cleanup = () => {
      canvasRef.current?.removeEventListener("pointerdown", handler);
      construction.build(diagram!).then(setDiagram);
    };
    setCleanupAction(() => cleanup);

    setDiagram(await construction.build(diagram!));
    setCurrAction("mkPoint");
  }

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
      if (!(new Set(validTags)).has(el.tag)) continue;
      const handler = async () => {
        construction.setSelected(el, true);

        if (selected.length < 2 && (selected.length === 0 || selected[0] !== el)) {
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
    }
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
      const s = construction.mkSegment(A as Point, B as Point);
      nameElementMap.set(description.steps[currStepIdx].resultNames[0], s);
      setCurrStepIdx(i => i + 1);
    });
  }

  const addLineOnClick = () => {
    setCurrAction("mkLine");
    setupSelect2Action(["Point"], (A, B) => {
      if (!checkAction("mkLine", [A, B])) {
        alert("bad!");
        return;
      }
      const l = construction.mkLine(A as Point, B as Point);
      nameElementMap.set(description.steps[currStepIdx].resultNames[0], l);
      setCurrStepIdx(i => i + 1);
    });
  }

  const addCircleOnClick =  () => {
    setCurrAction("mkCircle");
    setupSelect2Action(["Point"], (A, B) => {
      if (!checkAction("mkCircle", [A, B])) {
        alert("bad!");
        return;
      }
      const c = construction.mkCircle(A as Point, B as Point);
      nameElementMap.set(description.steps[currStepIdx].resultNames[0], c);
      setCurrStepIdx(i => i + 1);
    });
  }

  const addIntersectionsOnClick = () => {
    setCurrAction("mkIntersections");
    setupSelect2Action(["Segment", "Circle"], (A, B) => {
      if (!checkAction("mkIntersections", [A, B])) {
        alert("bad!");
        return;
      }
      const [C, D] = construction.mkIntersections(A, B);
      nameElementMap.set(description.steps[currStepIdx].resultNames[0], C);
      nameElementMap.set(description.steps[currStepIdx].resultNames[1], D);
      setCurrStepIdx(i => i + 1);
    });
  };

  const actionButton = (name: string, onClick: () => void) => {
    return <button
      onClick={onClick}
      disabled={currAction !== null}
      style={{
        padding: "0.5em 1em",
        fontSize: "1em",
        borderRadius: "5px",
        border: "1px solid #ccc",
        backgroundColor: currAction === null ? "#007bff" : "#ccc",
        color: "#fff",
        cursor: currAction === null ? "pointer" : "not-allowed",
        height: "fit-content",
        transition: "background-color 0.3s",
      }}
    >
      {name}
    </button>;
  }

  if (currStepIdx >= description.steps.length) {
    return <p>Construction complete!</p>;
  }

  const currStepDescription = description.steps[currStepIdx].description;

  return (
    <>
      {/* Place the following buttons in a div that looks nice*/}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "1em",
        }}
      >
        {actionButton("Add Point", addPointOnClick)}
        {actionButton("Add Segment", addSegmentOnClick)}
        {actionButton("Add Line", addLineOnClick)}
        {actionButton("Add Circle", addCircleOnClick)}
        {actionButton("Add Intersections", addIntersectionsOnClick)}
        <p>Press ESC to cancel action</p>
        <p>{currStepDescription}</p>
      </div>

      <div
        style={{
          border: "2px solid black",
          width: "50em",
          height: "50em",
        }}
        ref={canvasRef}
      >
        <Renderer diagram={diagram}/>
      </div>
    </>
  );
}