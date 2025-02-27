import React from "react";

import ElementsTest, {
  ConstructionDescription,
} from "../elements/ElementsPage.tsx";
import { walkthroughs } from "../elements/walkthrough/steps.ts";

export class ConstructionsPage extends React.Component<{}, { idx: number }> {
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
    const navBtnCSS =
      "py-1 px-2 rounded-md border-black border-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed disabled:border-none";
    return (
      <div>
        <div className="flex justify-center">
          <div className="flex flex-row m-4 gap-2 items-center">
            <button
              className={navBtnCSS}
              disabled={this.state.idx === 0}
              onClick={this.onClickPrev}
            >
              Previous
            </button>

            <div className="italic">{`Current walkthrough: "${
              this.walkthroughNames[this.state.idx]
            }"`}</div>

            <button
              className={navBtnCSS}
              onClick={this.onClickNext}
              disabled={this.state.idx >= this.walkthroughNames.length - 1}
            >
              Next
            </button>
          </div>
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
      </div>
    );
  }
}
