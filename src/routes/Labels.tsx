import {useMemo} from "react";
import {canvas, constraints, DiagramBuilder} from "@penrose/bloom";
import DiagramRepair from "../diagram-repair/repair.tsx";

export default function LabelsCorrectionPage() {
  const [db, selectable] = useMemo(() => {
    const db = new DiagramBuilder(canvas(400, 400));
    const c1 = db.circle({ r: 10 });
    const c2 = db.circle({ r: 10 });
    const c3 = db.circle({ r: 20 });
    return [db, [c1, c2, c3]];
  }, []);

  return (
    <div>
      <DiagramRepair db={db} selectable={selectable} possibleConstraints={new Map([
        ["Touching", constraints.touching],
        ["Overlapping", constraints.overlapping],
      ])} />
    </div>
  );
}