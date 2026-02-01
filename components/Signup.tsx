"use client";

import React from "react";
import axios from "axios";
import { useState } from "react";
import Link from "next/link";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      axios.post("/api/register", { username, email, password });
    } catch (error) {
      console.error(error);
    }

    alert("form submit logic not written");
  };
}
