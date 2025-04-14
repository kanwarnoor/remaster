import React from "react";
import { motion } from "framer-motion";

interface Props {
  handleSong: (action: string) => void;
  playing: boolean;
}

export default function Player({ handleSong, playing }: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: 50,
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
      className="w-[800px] justify-center m-auto items-center h-16 bg-white/80 backdrop-blur-xl text-black rounded-full flex"
    >
      <div className="w-[30%] h-full flex items-center justify-center  rounded-l-full">
        track
      </div>
      <div className="relative w-[40%] h-full flex items-center justify-center  gap-3">
        <div>
          {/* previous */}
          <div className="cursor-pointer" onClick={() => handleSong("previous")}>
            <svg
              viewBox="0 -2 12 12"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              className="fill-black size-9"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <title>previous [#999]</title> <desc>Created with Sketch.</desc>
                <defs> </defs>
                <g id="Page-1" stroke="none" strokeWidth="1" fillRule="evenodd">
                  <g
                    id="Dribbble-Light-Preview"
                    transform="translate(-104.000000, -3805.000000)"
                  >
                    <g id="icons" transform="translate(56.000000, 160.000000)">
                      <path
                        d="M59.9990013,3645.86816 L59.9990013,3652.13116 C59.9990013,3652.84516 58.8540013,3653.25316 58.2180013,3652.82516 L53.9990013,3650.14016 L53.9990013,3652.13116 C53.9990013,3652.84516 53.4260013,3653.25316 52.7900013,3652.82516 L48.4790013,3649.69316 C47.9650013,3649.34616 47.7980013,3648.65316 48.3120013,3648.30616 L52.7900013,3645.17516 C53.4260013,3644.74616 53.9990013,3645.15416 53.9990013,3645.86816 L53.9990013,3647.85916 L58.2180013,3645.17516 C58.8540013,3644.74616 59.9990013,3645.15416 59.9990013,3645.86816"
                        id="previous-[#999]"
                      ></path>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>
        {/* play/pause */}
        <div className="w-10 h-10">
          {playing ? (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-[3px] border-black  "
              onClick={() => handleSong("pause")}
            >
              <svg
                viewBox="0 0 16 16"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
                className="size-5 flex fill-black"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path d="M7 1H2V15H7V1Z"></path>
                  <path d="M14 1H9V15H14V1Z"></path>
                </g>
              </svg>
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-[3px] border-black  "
              onClick={() => handleSong("play")}
            >
              <svg
                fill="white"
                viewBox="0 0 32 32"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                className="size-7 cursor-pointer flex fill-black ml-1 "
              >
                <title>play</title>
                <path d="M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z"></path>
              </svg>
            </div>
          )}
        </div>
        <div>
          {/* next */}
          <div className="cursor-pointer" onClick={() => handleSong("next")}>
            <svg
              viewBox="0 -2 12 12"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              className="fill-black size-9 rotate-180"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <title>previous [#999]</title> <desc>Created with Sketch.</desc>
                <defs> </defs>
                <g id="Page-1" stroke="none" strokeWidth="1" fillRule="evenodd">
                  <g
                    id="Dribbble-Light-Preview"
                    transform="translate(-104.000000, -3805.000000)"
                  >
                    <g id="icons" transform="translate(56.000000, 160.000000)">
                      <path
                        d="M59.9990013,3645.86816 L59.9990013,3652.13116 C59.9990013,3652.84516 58.8540013,3653.25316 58.2180013,3652.82516 L53.9990013,3650.14016 L53.9990013,3652.13116 C53.9990013,3652.84516 53.4260013,3653.25316 52.7900013,3652.82516 L48.4790013,3649.69316 C47.9650013,3649.34616 47.7980013,3648.65316 48.3120013,3648.30616 L52.7900013,3645.17516 C53.4260013,3644.74616 53.9990013,3645.15416 53.9990013,3645.86816 L53.9990013,3647.85916 L58.2180013,3645.17516 C58.8540013,3644.74616 59.9990013,3645.15416 59.9990013,3645.86816"
                        id="previous-[#999]"
                      ></path>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>
        <div className="absolute w-[50%] bottom-0 left-0 transition-all">
          <div className="bg-black/50 h-1 flex justify-end relative cursor-pointer group">
            <div className="bg-black h-2 w-1 absolute mb-auto -top-1 group-hover:scale-110 transition-all"></div>
          </div>
        </div>
      </div>
      <div className="w-[30%] h-full flex items-center justify-center  rounded-r-full">
        extras
      </div>
    </motion.div>
  );
}
