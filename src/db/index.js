import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${DB_NAME}`
    );
    console.log(
      "MONGO_DB CONNECTED SUCCESSFULLY AT HOST:",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("MONGO_DB CONNECTION FAILED", error);
  }
};
export { connectDB };

