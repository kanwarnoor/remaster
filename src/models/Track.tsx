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
    art: {
      type: String,
      required: false,
      default: "undefined",
    },
  },
  {
    timestamps: true,
  }
);

const Track = mongoose.models.Tracks || mongoose.model("Tracks", trackModel);

export default Track;
