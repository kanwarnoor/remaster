import React from "react";

interface Props {
  checked: boolean;
  handleChange: () => void;
}

export default function Switch(props: Props) {
  return (
    <div
      className="flex items-center ml-2 cursor-pointer"
      onClick={props.handleChange}
    >
      <div
        className={`relative inline-flex items-center w-10 h-6 rounded-full transition-colors duration-200 ${
          props.checked ? "bg-black/50" : "bg-black/20"
        }`}
      >
        <span
          className={`inline-block w-6 h-6 bg-white border border-black/20 rounded-full transition-transform duration-200 ${
            props.checked ? "translate-x-4 !bg-black" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
}
