import React from "react";
import CircleAreaDiagram from "../visual-proofs/circle-area.tsx";
import ChordProductDiagram from "../visual-proofs/chord-product.tsx";

export class InteractiveExplanations extends React.Component {
  render() {
    return (
      <>
        <h1>Interactive Explanations</h1>
        <CircleAreaDiagram />
        <ChordProductDiagram />
      </>
    );
  }
}
