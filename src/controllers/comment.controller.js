import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const addComment = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  if (!postId) throw new ApiError(404, "PostId Required");
  const { content } = req.body;
  if (!content) throw new ApiError(404, "Comment Content Required");
  await Comment.create({
    content,
    user: req.user._id,
    post: postId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment Add Successfully"));
});
const removeComment = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;
  if (!commentId) throw new ApiError(404, "CommentId Required");
  if (!mongoose.Types.ObjectId.isValid(commentId))
    throw new ApiError(400, "Invalid Comment Id");
  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    user: req.user._id,
  });
  if (!comment) throw new ApiError(404, "Comment not found or Invalid User");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment Deleted Successfully"));
});
const updateComment = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;
  if (!commentId) throw new ApiError(404, "CommentId Required");
  if (!mongoose.Types.ObjectId.isValid(commentId))
    throw new ApiError(400, "Invalid Comment Id");
  const { content } = req.body;
  if (!content) throw new ApiError(404, "Comment Content Required");

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, user: req.user._id },
    {
      $set: { content },
    }
  );

  if (!comment) throw new ApiError(404, "Comment not found or Invalid User");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment Updated Successfully"));
});
const getComments = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  if (!postId) throw new ApiError(404, "Post Id Required");
  if (!mongoose.Types.ObjectId.isValid(postId))
    throw new ApiError(400, "Invalid Post Id");
  const comment = await Comment.aggregate([
    {
      $match: {
        post: new mongoose.Types.ObjectId(postId),
      },
    },
    {
      $facet: {
        metadata: [
          {
            $count: "totalComment",
          },
        ],
        comments: [
          {
            $sort: { createdAt: -1 },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$user",
          },
          {
            $project: {
              content: 1,
              user: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalComments: {
          $ifNull: [{ $arrayElemAt: ["$metadata.totalComment", 0] }, 0],
        },
      },
    },
    {
      $project: {
        totalComments: 1,
        comments: 1,
      },
    },
  ]);
  if (!comment) throw new ApiError(404, "Post not Found");
  return res
    .status(200)
    .json(new ApiResponse(200, comment[0], "Comment Fetched Successfully"));
});
export { addComment, getComments, removeComment, updateComment };
