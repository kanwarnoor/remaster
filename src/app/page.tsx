"use client";

import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [clicked, setClicked] = useState(false);
  const [todo, setTodo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [task, setTask] = useState<string>("");

  const fetchTasks = async () => {
    try {
      const response = await axios.get("/api/todo");
      setTodo(response.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post("/api/todo", {
        title: task,
      });
      await fetchTasks();
      setTask("");
      setClicked(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/todo/${id}`);
      await fetchTasks();
    } catch (error) {
      console.log(error);
    }
  };

  const setTrue = async (id: string) => {
    try {
      await axios.put(`/api/todo/${id}/complete`, { isCompleted: true });
      await fetchTasks();
    } catch (error) {
      console.log(error);
    }
  };
  const setFalse = async (id: string) => {
    try {
      await axios.put(`/api/todo/${id}/complete`, { isCompleted: false });
      await fetchTasks();
    } catch (error) {
      console.log(error);
    }
  };

  return !clicked ? (
    <div className="flex flex-col m-auto w-screen h-screen">
      <div className="flex flex-col w-fit m-auto text-center ">
        <h1 className="text-6xl font-bold">Remaster Todo</h1>
        <motion.p
          initial={{
            scale: 1,
          }}
          whileTap={{
            scale: 1.2,
          }}
          className="text-2xl font-bold m-auto mb-10 border-2 rounded-full px-5 py-[1px] mt-2 border-black bg-black text-white cursor-pointer duration-150"
          onClick={() => setClicked(!clicked)}
        >
          Add +
        </motion.p>

        {loading ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
            width="50"
            height="50"
            className="flex m-auto"
            style={{
              shapeRendering: "auto",
              display: "block",
              background: "transparent",
            }}
          >
            <g>
              <circle
                strokeDasharray="164.93361431346415 56.97787143782138"
                r="35"
                strokeWidth="10"
                stroke="#000000"
                fill="none"
                cy="50"
                cx="50"
              >
                <animateTransform
                  keyTimes="0;1"
                  values="0 50 50;360 50 50"
                  dur="1s"
                  repeatCount="indefinite"
                  type="rotate"
                  attributeName="transform"
                ></animateTransform>
              </circle>
            </g>
          </svg>
        ) : (
          <div>
            {todo.length == 0 && "No tasks added."}

            <ul className="space-y-3 mb-10">
              {todo.map((task, index) => {
                return (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: index * 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="flex w-fit px-5 m-auto flex-row h-12 border-2  rounded-full justify-center items-center"
                    key={task._id}
                  >
                    <li className="text-xl font-semibold">{task.title}</li>
                    <div className="ml-5 flex-row flex">
                      {task.isCompleted ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-7 cursor-pointer"
                          onClick={() => setFalse(task._id)}
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          onClick={() => setTrue(task._id)}
                          className="size-7 cursor-pointer"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      )}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="red"
                        className="size-7 cursor-pointer"
                        onClick={() => handleDelete(task._id)}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </div>
                  </motion.div>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex flex-col m-auto w-screen h-screen ">
      <div
        onClick={() => setClicked(false)}
        className="absolute right-0 mr-10 mt-10 cursor-pointer hover:scale-110 duration-150 "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          className="size-10"
          fill="black"
        >
          <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
        </svg>
      </div>
      <motion.div
        initial={{
          scale: 0.9,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        
        className="flex flex-col w-fit m-auto text-center"
      >
        <h1 className="text-6xl font-bold">Add a Task</h1>
        <form name="flex flex-col" onSubmit={(e) => handleSubmit(e)}>
          <input
            className="border-2 md:w-[500px] w-[300px] px-5 py-2 mt-10 rounded-xl text-xl font-semibold"
            required
            value={task}
            onChange={(e) => setTask(e.target.value)}
            type="text"
          />
          <motion.button
            initial={{
              scale: 1,
            }}
            whileTap={{
              scale: 1.2,
            }}
            className="flex text-2xl w-fit h-fit font-semibold m-auto mb-10 border-2 rounded-full px-5 py-[1px] pt-0 mt-2 border-black bg-black text-white cursor-pointer duration-150"
            type="submit"
          >
            Save
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
