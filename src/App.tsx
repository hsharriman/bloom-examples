// import ParallelLinesConstructor from "./constructions/parallel-lines";
// import PythagoreanComputedConstructor from "./constructions/pythagorean-computed";
// import PythagoreanConstructor from "./constructions/pythagorean";
import ElementsTest from "./elements/elements-walkthrough";
import CircleAreaDiagram from "./visual-proofs/circle-area.tsx";

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
        {/*<ElementsTest walkthroughName="bisector" />*/}
        <CircleAreaDiagram />
      </div>
    </>
  );
}

export default App;
