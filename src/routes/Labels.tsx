import {useEffect, useMemo, useState} from "react";
import {canvas, constraints, DiagramBuilder, Shape} from "@penrose/bloom";
import DiagramRepair from "../diagram-repair/repair.tsx";
import statesDiagramBuilder from "../diagram-repair/map.ts";

export default function LabelsCorrectionPage() {
  const [db, setDb] = useState<DiagramBuilder | null>(null);
  const [selectableElems, setSelectableElems] = useState<Shape[]>([]);

  useEffect(() => {
    (async () => {
      const [db, textElems] = await statesDiagramBuilder();
      setDb(db);
      setSelectableElems(textElems);
    })();
  }, []);

  if (!db) return <div>Loading...</div>;

  return (
    <div>
      <DiagramRepair
        db={db}
        selectable={selectableElems}
        possibleConstraints={new Map([
          ["Disjoint", (s1, s2) => constraints.disjoint(s1, s2)],
        ])}
      />
    </div>
  );
}