import mongoose, { Schema } from "mongoose";

const userModel = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9_]{1,20}$/,
        "Username can only contain letters, numbers, and underscores, and must be 1-20 characters long.",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address.",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      match: [/^.{8,}$/, "Password must be at least 8 characters long."],
    },
    premium: {
      type: Boolean,
      default: false,
    },
    tracks: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tracks",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.Users || mongoose.model("Users", userModel);

export default User;
