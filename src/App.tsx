import { DiagramComponent } from "./components/DiagramComponent";
import { BisectSegmentConstruction } from "./constructions/euclid_book1/10_bisect_segment";
import { EquilateralTriangleConstruction } from "./constructions/euclid_book1/1_equilateral_triangle";
import { MoveSegmentConstruction } from "./constructions/euclid_book1/2_move_segment";
import { CutLengthConstruction } from "./constructions/euclid_book1/3_cut_given_length";
import { IsoscelesConstruction } from "./constructions/euclid_book1/5_isosceles";
import { BisectAngleConstruction } from "./constructions/euclid_book1/9_bisect_angle";

const constructions = [
  EquilateralTriangleConstruction,
  MoveSegmentConstruction,
  CutLengthConstruction,
  IsoscelesConstruction,
  BisectAngleConstruction,
  BisectSegmentConstruction,
];
function App() {
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          placeContent: "space-evenly",
        }}
      >
        {constructions.map((c, i) => (
          <DiagramComponent diagram={c} key={`construction-${i}`} />
        ))}
        {/* <PerpendicularBisectorConstructor /> */}
        {/* <PythagoreanConstructor /> */}
        {/* <PythagoreanComputedConstructor /> */}
        {/* <ParallelLinesConstructor /> */}
      </div>
    </>
  );
}

export default App;
