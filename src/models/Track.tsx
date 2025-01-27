import mongoose, { Schema } from "mongoose";

const trackModel = new Schema(
  {
    name: {
      type: String,
      required: false,
      default: "untitled",
    },
    artist: {
      type: String,
      required: false,
      default: "undefined",
    },
    album: {
      type: String,
      required: false,
      default: "undefined",
    },
    art: {
      type: String,
      required: false,
      default: "undefined",
    },
    url: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: false,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  {
    timestamps: true,
  }
);

const Track = mongoose.models.Tracks || mongoose.model("Tracks", trackModel);

export default Track;
