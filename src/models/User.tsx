import mongoose, { Schema } from "mongoose";

const userModel = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[a-zA-Z0-9_]{1,20}$/,
      "Username can only contain letters, numbers, and underscores",
    ],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address",
    ],
  },
  password: {
    type: String,
    required: true,
    match: [/^.{8,}$/, "Password must be at least 8 characters long"],
  },
});

const User = mongoose.models.User || mongoose.model("User", userModel);

export default User;
