import {constraints, Diagram, DiagramBuilder, Renderer, Shape, Vec2} from "@penrose/bloom";
import {useEffect, useRef, useState} from "react";
import {mul, Num, ops} from "@penrose/core";
import {bboxFromShape} from "@penrose/core/dist/lib/Queries";
import {toPenroseShape} from "@penrose/bloom/dist/core/utils";
import {ActionButton} from "../elements/components/ActionButton";

export default function DiagramRepair(
  props: {
    db: DiagramBuilder,
    selectable: Shape[],
    possibleConstraints: Map<string, (s1: Shape, s2: Shape) => Num>
  }
) {
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const selected = useRef<Shape[]>([]);
  const setup = useRef<boolean>(false);
  const [dummy, setDummy] = useState<boolean>(false);

  useEffect(() => {
    if (setup.current) return;
    setup.current = true;

    props.selectable.map(s => {
      const bbox = bboxFromShape(toPenroseShape(s));

      const selectedInputName = `selected-${s.name}`;
      const opacity = props.db.input({ name: selectedInputName, init: 0, optimized: false });

      const selectorIcon = props.db.rectangle({
        fillColor: [0, 0, 0, 0],
        strokeWidth: 2,
        strokeColor: ops.vmul(opacity, [1, 0, 0, 1]),
        width: bbox.width,
        height: bbox.height,
        center: bbox.center as Vec2
      });

      props.db.addEventListener(s, "pointerdown", (_, diagram) => {
        const curr = diagram.getInput(selectedInputName);
        if (curr > 0) {
          diagram.setInput(selectedInputName, 0);
          selected.current.splice(selected.current.findIndex(v => v === s), 1);
        } else {
          diagram.setInput(selectedInputName, 1);
          selected.current.push(s);
          if (selected.current.length > 2) {
            const old = selected.current.splice(selected.current.length - 2, 1)[0];
            diagram.setInput(`selected-${old!.name}`, 0);
          }
        }

        console.log(selected.current);
        setDummy(d => !d);
      });

      props.selectable.map(t => {
        if (t === s) return;
        for (const [constrName, constr] of props.possibleConstraints.entries()) {
          const constrInputName = `${s.name}-${t.name}-${constrName}`;
          const constrInput = props.db.input({ name: constrInputName, init: 0, optimized: false });
          props.db.ensure(mul(constr(s, t), constrInput));
        }
      });
    }, []);

    props.db.build().then(setDiagram);
  }, [props.db, props.selectable]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "left"
      }}
    >
      <div
        style={{
          width: "50em",
          height: "50em",
          border: "3px solid black",
          margin: "1em"
        }}
      >
        <Renderer diagram={diagram} />
      </div>
      <div
        style={{
          margin: "1em",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start"
        }}
      >
        {Array.from(props.possibleConstraints.entries()).map(([name]) => (
          ActionButton(name, selected.current.length !== 2, () => {
            const [s, t] = selected.current;
            diagram?.setInput(`${s.name}-${t.name}-${name}`, 1);
            diagram?.setInput(`selected-${s.name}`, 0);
            diagram?.setInput(`selected-${t.name}`, 0);
            selected.current = [];
            setDummy(d => !d);
          })
        ))}
      </div>
    </div>
  );
}