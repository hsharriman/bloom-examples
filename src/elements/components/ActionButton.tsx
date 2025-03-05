export const ActionButton = (
  name: string,
  currAction: boolean,
  onClick: () => void
) => {
  return (
    <button
      onClick={onClick}
      disabled={currAction}
      className={`px-2 py-2 rounded-md text-lg border-r-2 ${
        !currAction
          ? "bg-blue-500 cursor-pointer hover:bg-blue-300"
          : "bg-gray-300 cursor-not-allowed"
      } text-white transition-all mb-2 w-48`}
    >
      {name}
    </button>
  );
};
