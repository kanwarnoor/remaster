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
    s3Key: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: false,
      default: "undefined",
    },
    album: {
      type: String,
      required: false,
    },
    duration: {
      type: Number,
      required: true,
      default: 0,
    },
    art: {
      type: String,
      required: false,
      default: "undefined",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
  },
  {
    timestamps: true,
  }
);

const Track = mongoose.models.Tracks || mongoose.model("Tracks", trackModel);

export default Track;
