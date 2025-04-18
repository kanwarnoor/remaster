import { defaultOverrides } from "next/dist/server/require-hook";
import React from "react";

interface Props {
  list: {
    name: string;
    icon?: string;
    handleOption?: (action: string) => void;
  }[];
}

export default function Options({ list }: Props) {
  return (
    <>
      <div className="absolute right-10 mt-2 w-48 text-center bg-white/25 backdrop-blur-xl rounded-md shadow-lg z-10" key={"option"}>
        <ul className="">
          {list.map((option, index) => {
            return (
              <li className="px-4 py-2 hover:bg-white/25 first:rounded-t-md first:pt-3 last:pb-3 last:rounded-b-md cursor-pointer" key={index} onClick={() => {
                if (option.handleOption) {
                  option.handleOption(option.name);
                }
              }}>
                {option.name}
              </li>
            );
          })}
         
        </ul>
      </div>
    </>
  );
}
