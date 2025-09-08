import mongoose, { Schema } from "mongoose";
const likeSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  {
    timestamps: true,
  }
);
export const Like = mongoose.model("Like", likeSchema);
