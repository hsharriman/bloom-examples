import React from "react";

import ElementsTest, {
  ConstructionDescription,
} from "../elements/ElementsPage.tsx";
import { Dropdown } from "../elements/components/Dropdown.tsx";
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

  render() {
    return (
      <div>
        <div className="flex justify-center h-12">
          <div className="flex flex-row m-2 mb-0 gap-2 items-center">
            <div className="italic">{`Current walkthrough: `}</div>
            <Dropdown
              idx={this.state.idx}
              items={this.walkthroughNames}
              onClick={(idx: number) => this.setState({ idx })}
            />
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
