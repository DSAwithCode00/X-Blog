import mongoose, { Schema } from "mongoose";
const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment Content is Required"],
    },
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
export const Comment = mongoose.model("Comment", commentSchema);
