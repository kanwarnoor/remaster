import Cookies from "js-cookie";

import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { useRouter } from "next/navigation";

export const user = async () => {
  const token = Cookies.get("token");

  if(!token){
    return null;
  }

  // decode and verify token
  const user = await jwt.decode(token);


  // return true if token is valid
  return user;
};