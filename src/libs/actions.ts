"use server"

import Cookies from "js-cookie"
import jwt from "jsonwebtoken";


export async function getSignedUrl() {
  
  const token = Cookies.get("token");
  const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedUser;
  return {success: {url: ""}}  
}