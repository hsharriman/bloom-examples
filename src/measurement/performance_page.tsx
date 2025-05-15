import {
  canvas,
  constraints,
  Diagram,
  DiagramBuilder,
  Renderer,
  SharedInput, sub,
  useDiagram,
  useSharedInput
} from "@penrose/bloom";
import {useEffect, useRef, useState} from "react";
import {buildDiscDiagram} from "../misc/discs.tsx";
import {buildReflectionDiagram} from "../misc/reflection.tsx";

export const InstrumentDiagram = (
  props: {
    diagram: Diagram | null
  }
) => {
  const data = useRef<Map<string, number[]>>(new Map());
  const [reset, setReset] = useState<boolean>(false);

  useEffect(() => {
    let lastStartTime: number;
    let lastStepTime: number;
    let lastXs: number[];

    data.current = new Map([["opt_time", []], ["step_time", []], ["diff_norm", []]]);

    const onOptimizationStarted = (xs: number[]) => {
      lastStartTime = performance.now();
      lastStepTime = lastStartTime;
      lastXs = xs;
    }

    const onOptimizationStep = (xs: number[]) => {
      const now = performance.now();
      const dt = now - lastStepTime;
      lastStepTime = now;
      data.current.get("step_time")!.push(dt);

      // find norm diff between xs and lastXs
      const diff = Math.sqrt(xs.reduce((acc, x, i) => acc + (x - lastXs[i]) * (x - lastXs[i]), 0));
      data.current.get("diff_norm")!.push(diff);
      lastXs = xs;

      data.current.get("opt_time")!.push(-1);
    }

    const onOptimizationFinished = (xs: number[]) => {
      const now = performance.now();
      const dt = now - lastStartTime;
      data.current.get("opt_time")!.pop();
      data.current.get("opt_time")!.push(dt);
    }

    props.diagram?.setOnOptimizationStepped(onOptimizationStep);
    props.diagram?.setOnOptimizationStarted(onOptimizationStarted);
    props.diagram?.setOnOptimizationFinished(onOptimizationFinished);
  }, [props.diagram, reset]);

  const saveData = () => {
    // print lengths
    console.log(data.current.get("opt_time")!.length);
    console.log(data.current.get("step_time")!.length);
    console.log(data.current.get("diff_norm")!.length);
    const columns = ["step","opt_time", "step_time", "diff_norm"].join(",");
    const rows = data.current.get("opt_time")!.map((_, i) => {
      return [
        i,
        data.current.get("opt_time")![i],
        data.current.get("step_time")![i],
        data.current.get("diff_norm")![i],
      ].join(",");
    });

    const text = [columns, ...rows].join("\n");

    const csv = document.createElement('a');
    csv.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    csv.setAttribute('download', `data.csv`);
    csv.click();

    setReset(b => !b);
  };

  if (!props.diagram) {
    return null;
  }

  return (
    <div>
      <div style={{ width: "400px", height: "400px" }}>
        <Renderer diagram={props.diagram} />
      </div>
      <input style={{ margin: "auto", width: "100%" }} type={"button"} value={"Save Data"} onClick={saveData}/>
      <input style={{ margin: "auto", width: "100%" }} type={"button"} value={"Reset"} onClick={() => setReset(b => !b)}/>
    </div>
  );
}

export default function PerformancePage() {
  const discs = useDiagram(buildDiscDiagram);
  const reflection = useDiagram(buildReflectionDiagram);

  return (<>
    <div style={{
      marginTop: "5em",
      margin: "auto",
      width: "50%",
      height: "50%",
    }}
    >
      <Renderer diagram={discs} />
    </div>
    <div style={{
      marginTop: "50em",
      margin: "auto",
      width: "50%",
      height: "50%",
    }}>
      <Renderer diagram={reflection} />
    </div>
    </>);
}