import React from "react";
import CircleAreaDiagram from "../visual-proofs/circle-area.tsx";
import ChordProductDiagram from "../visual-proofs/chord-product.tsx";
import PythagoreanComputedConstructor from "../constructions/pythagorean-computed.tsx";

export class InteractiveExplanations extends React.Component {
  render() {
    return (
      <>
        <h1
          className="m-4 font-extrabold leading-none tracking-tight text-gray-900 lg:text-3xl">
          Interactive Explanations
        </h1>
        <h2
          className="m-4 mt-20 font-bold leading-none tracking-tight text-gray-900 lg:text-2xl">
          Circle Area
        </h2>
        <div style={{ width: "100em" }}>
          <CircleAreaDiagram/>
        </div>

        <h2
          className="m-4 mt-20 font-bold leading-none tracking-tight text-gray-900 lg:text-2xl">
          Chord Product
        </h2>
        <ChordProductDiagram/>

        <h2
          className="m-4 mt-20 font-bold leading-none tracking-tight text-gray-900 lg:text-2xl">
          Pythagorean Theorem
        </h2>
        <PythagoreanComputedConstructor/>
      </>
    );
  }
}
