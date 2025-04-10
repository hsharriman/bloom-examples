import { useState } from "react";

export interface DropdownItem {
  text: string;
  onClick: () => void;
}
export interface DropdownProps {
  items: string[];
  idx: number;
  onClick: (idx: number) => void;
}
export const Dropdown = (props: DropdownProps) => {
  let [showList, setShowList] = useState(false);
  setShowList.bind(this);

  const listItems = props.items.map((item, i) => {
    const onClick = () => {
      setShowList(false);
      props.onClick(i);
    };
    return (
      <div
        className="block px-4 py-2 text-sm text-gray-700"
        tabIndex={-1}
        id={`menu-item-${i}`}
        onClick={onClick}
      >
        {item}
      </div>
    );
  });

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50"
          id="menu-button"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={() => setShowList(!showList)}
        >
          {props.items[props.idx]}
          <svg
            className="-mr-1 size-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            data-slot="icon"
          >
            <path
              fill-rule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* <!--
  Dropdown menu, show/hide based on menu state.

  Entering: "transition ease-out duration-100"
    From: "transform opacity-0 scale-95"
    To: "transform opacity-100 scale-100"
  Leaving: "transition ease-in duration-75"
    From: "transform opacity-100 scale-100"
    To: "transform opacity-0 scale-95"
--> */}
      <div
        className={`${
          showList ? "block" : "hidden"
        } absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden`}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
        tabIndex={-1}
      >
        <div className="py-1 overflow-scroll max-h-[400px]" role="none">
          {listItems}
        </div>
      </div>
    </div>
  );
};
