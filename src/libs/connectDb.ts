import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(String(process.env.MONGO_URI));
    console.log("Db connected!");
  } catch (error) {
    console.log(error);
  }
};

export default connectDb;