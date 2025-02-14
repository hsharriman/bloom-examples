import React from "react";
import { NavLink, Outlet } from "react-router";

export class Home extends React.Component {
  render() {
    const linkCSS = "py-1 px-2 rounded-md text-black text-md ";
    return (
      <>
        <div className="flex flex-row gap-4 border-b-2 border-slate-300 items-center">
          <div className="font-bold text-2xl m-4">Bloom Examples</div>
          <NavLink
            to="/bloom-examples/constructions"
            className={linkCSS + "bg-amber-300"}
          >
            Constructions
          </NavLink>
          <NavLink
            to="/bloom-examples/explanations"
            className={linkCSS + "bg-blue-300"}
          >
            Interactive Explanations
          </NavLink>
          <NavLink
            to="/bloom-examples/vegalite-labels"
            className={linkCSS + "bg-fuchsia-200"}
          >
            Bloom Examples
          </NavLink>
        </div>

        <Outlet />
      </>
    );
  }
}
