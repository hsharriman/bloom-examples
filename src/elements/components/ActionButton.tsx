export const ActionButton = (
  name: string,
  currAction: boolean,
  onClick: () => void,
  show: boolean
) => {
  return (
    <button
      onClick={onClick}
      disabled={currAction}
      className={`${
        show ? "block" : "hidden"
      } px-2 py-1 rounded-2xl text-md border-r-2 ${
        !currAction
          ? "bg-blue-500 cursor-pointer hover:bg-blue-300"
          : "bg-gray-300 cursor-not-allowed"
      } text-white transition-all mb-2 w-auto max-w-48 font-mono`}
    >
      {name}
    </button>
  );
};
