import mongoose, { Schema } from "mongoose";

const trackModel = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    name: {
      type: String,
      required: true,
      default: "untitled",
    },
    size: {
      type: Number,
      required: true,
    },
    audio: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    artist: {
      type: String,
      required: false,
      default: "undefined",
    },
    duration: {
      type: Number,
      required: true,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },

    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Track = mongoose.models.Tracks || mongoose.model("Tracks", trackModel);

export default Track;
