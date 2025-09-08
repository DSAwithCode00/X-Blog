import mongoose, { Schema } from "mongoose";
const tagSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Tag Title is Required"],
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});
export const Tag = mongoose.model("Tag", tagSchema);
