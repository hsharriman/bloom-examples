// import ParallelLinesConstructor from "./constructions/parallel-lines";
// import PythagoreanComputedConstructor from "./constructions/pythagorean-computed";
// import PythagoreanConstructor from "./constructions/pythagorean";
import ElementsTest from "./elements/elements-walkthrough";

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
        <ElementsTest walkthroughName="bisector" />
      </div>
    </>
  );
}

export default App;
