import mongoose, { Schema } from "mongoose";
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is Required"],
    },
    description: {
      type: String,
      required: [true, "Description is Required"],
    },
    author: {
      type: Schema.Types.ObjectId,  
      ref: "User",
    },
    image: {
      type: String,
      required: [true, "Image is Required"],
    },
  },
  {
    timestamps: true,
  }
);
export const Post = mongoose.model("Post", postSchema);
