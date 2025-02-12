// import ParallelLinesConstructor from "./constructions/parallel-lines";
// import PythagoreanComputedConstructor from "./constructions/pythagorean-computed";
// import PythagoreanConstructor from "./constructions/pythagorean";
import React from "react";
import ElementsTest, {
  ConstructionDescription,
} from "./elements/elements-walkthrough";
import { walkthroughs } from "./elements/walkthroughs.ts";
export class App extends React.Component<{}, { idx: number }> {
  private walkthroughNames = walkthroughs.map(
    (w: ConstructionDescription) => w.name
  );
  constructor(props: {}) {
    super(props);
    this.state = {
      idx: 0,
    };
  }
  onClickNext = () => {
    if (this.state.idx === this.walkthroughNames.length - 1) {
      return;
    }
    this.setState({ idx: this.state.idx + 1 });
  };

  onClickPrev = () => {
    if (this.state.idx === 0) {
      return;
    }
    this.setState({ idx: this.state.idx - 1 });
  };
  render() {
    return (
      <>
        <div className="flex flex-row gap-2 items-center m-4">
          {this.state.idx > 0 && (
            <button
              className="py-1 px-2 rounded-md border-black border-2"
              onClick={this.onClickNext}
            >
              Previous
            </button>
          )}
          <div className="italic">{`Current walkthrough: "${
            this.walkthroughNames[this.state.idx]
          }"`}</div>
          {this.state.idx < this.walkthroughNames.length - 1 && (
            <button
              className="py-1 px-2 rounded-md border-black border-2"
              onClick={this.onClickNext}
            >
              Next
            </button>
          )}
          <div></div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            placeContent: "space-evenly",
          }}
        >
          {/* <EquilateralTriangleConstruction />
        <PerpendicularBisectorConstructor /> */}
          {/* <PythagoreanConstructor /> */}
          {/*<PythagoreanComputedConstructor />*/}
          {/* <ParallelLinesConstructor /> */}
          <ElementsTest
            walkthroughName={this.walkthroughNames[this.state.idx]}
          />
        </div>
      </>
    );
  }
}
export default App;
