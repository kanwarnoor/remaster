import mongoose, { Schema } from "mongoose";

const albumModel = new Schema({
  name: {
    type: String,
    required: true,
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
    type: Boolean,
    default: false,
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
});

const Album = mongoose.models.Album || mongoose.model("Album", albumModel);

export default Album;
