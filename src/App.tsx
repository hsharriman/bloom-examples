import ParallelLinesConstructor from "./constructions/parallel-lines";
import PythagoreanComputedConstructor from "./constructions/pythagorean-computed";
import PythagoreanConstructor from "./constructions/pythagorean";
import ElementsTest from "./elements/elements_test";

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
        {/*<PythagoreanComputedConstructor />*/}
        {/* <ParallelLinesConstructor /> */}
        <ElementsTest />
      </div>
    </>
  );
}

export default App;
