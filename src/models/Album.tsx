import mongoose, { Schema } from "mongoose";

const albumModel = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    s3Key: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    visibility: {
      type: String,
      default: "private",
      required: false,
    },
    tracks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Track",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Album = mongoose.models.Album || mongoose.model("Album", albumModel);

export default Album;
