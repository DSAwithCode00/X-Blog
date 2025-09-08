import mongoose, { Schema } from "mongoose";
const followerSchema = new mongoose.Schema({
     follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
});
export const Follower = mongoose.model("Follower", followerSchema);