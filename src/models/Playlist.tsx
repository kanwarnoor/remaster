import mongoose, { Schema } from "mongoose";

const playlistModel = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
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
  s3Key: {
    type: String,
    required: false,
  },
  image: {
    type: Boolean,
    default: false,
    required: false,
  },
});

const Playlist =
  mongoose.models.Playlist || mongoose.model("Playlist", playlistModel);

export default Playlist;
