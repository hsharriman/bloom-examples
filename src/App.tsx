import EquilateralTriangleConstruction from "./constructions/equilateral_triangle.tsx";
import PerpendicularBisectorConstructor from "./constructions/perpendicular_bisector.tsx";
import PythagoreanConstructor from "./constructions/pythagorean.tsx";

function App() {
  return (
    <>
      <div style={{
        display: "flex",
        flexDirection: "row",
        placeContent: "space-evenly",
      }}>
        <EquilateralTriangleConstruction />
        <PerpendicularBisectorConstructor />
        <PythagoreanConstructor />
      </div>
    </>
  );
}

export default App;
