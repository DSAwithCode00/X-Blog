import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const addLike = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  if (!postId) throw new ApiError(400, "PostId Required");
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post Not Found");
  const liked = await Like.findOne({ post: postId, user: req.user._id });
  if (liked) throw new ApiError(400, "Already Liked");
  await Like.create({
    user: req.user._id,
    post: postId,
  });
  return res.status(200).json(new ApiResponse(200, null, "Liked Successfully"));
});

const removeLike = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  if (!postId) throw new ApiError(400, "PostId Required");
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post Not Found or Invalid User");
  await Like.findOneAndDelete({ user: req.user._id, post: postId });
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Remove Like Successfully"));
});
const getLikes = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  if (!postId) throw new ApiError(400, "PostId Required");
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post Not Found");
  const [likesCount] = await Like.aggregate([
    {
      $match: {
        post: new mongoose.Types.ObjectId(postId),
      },
    },
    {
      $count: "likesCount",
    },
    {
      $project: {
        likesCount: {
          $ifNull: ["$likesCount", 0],
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, likesCount, "Count Like Operation Done"));
});
export { addLike, getLikes, removeLike };
