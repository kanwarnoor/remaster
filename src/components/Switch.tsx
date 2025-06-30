import React, { useState } from "react";

interface Props {
  checked: boolean;
  handleChange: () => void;
}

export default function Switch(props: Props) {
  return (
    <div>
      <div className="flex items-center ml-2">
        <div className="relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
          <input
            type="checkbox"
            className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer checked:translate-x-full checked:bg-black focus:outline-none focus:ring-0 border-black/20"
            checked={props.checked}
            onChange={() => props.handleChange()}
          />
          <label className="block h-full bg-black/20 rounded-full cursor-pointer peer-checked:bg-black/50"></label>
        </div>
      </div>
    </div>
  );
}
