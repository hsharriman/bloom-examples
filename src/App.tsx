import ParallelLinesConstructor from "./constructions/parallel-lines";
import PythagoreanComputedConstructor from "./constructions/pythagorean-computed";
import PythagoreanConstructor from "./constructions/pythagorean";

function App() {
  return (
    <>
      <div style={{
        display: "flex",
        flexDirection: "row",
        placeContent: "space-evenly",
      }}>
        {/* <EquilateralTriangleConstruction />
        <PerpendicularBisectorConstructor /> */}
        {/* <PythagoreanConstructor /> */}
        <PythagoreanComputedConstructor />
        {/* <ParallelLinesConstructor /> */}
      </div>
    </>
  );
}

export default App;
