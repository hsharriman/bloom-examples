import EquilateralTriangleConstruction from "./constructions/equilateral_triangle.tsx";
import PerpendicularBisectorConstructor from "./constructions/perpendicular_bisector.tsx";

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
      </div>
    </>
  );
}

export default App;
