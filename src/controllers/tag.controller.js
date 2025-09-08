import mongoose from "mongoose";
import { Tag } from "../models/tag.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addTag = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const { title } = req.body;
  if (!postId) throw new ApiError(404, "Post Id Required");
  if (!mongoose.Types.ObjectId.isValid(postId))
    throw new ApiError(400, "Invalid Post Id");
  if (!title) throw new ApiError(404, "Tag title Required");
  const alreadyAdded = await Tag.findOne({
    title,
  });
  if (alreadyAdded) throw new ApiError(400, "Already Added");
  const tag = await Tag.create({
    title,
    author: req.user._id,
    post: postId,
  });
  if (!tag) throw new ApiError(500, "Failed to Create Tag");
  return res
    .status(200)
    .json(new ApiResponse(200, tag, "Tag created Successfully"));
});
const deleteTag = asyncHandler(async (req, res) => {
  const tagId = req.params.tagId;
  if (!tagId) throw new ApiError(404, "Tag Id Required");
  if (!mongoose.Types.ObjectId.isValid(tagId))
    throw new ApiError(400, "Invalid Tag Id");
  const postId = req.params.postId;
  if (!postId) throw new ApiError(404, "postId Id Required");
  if (!mongoose.Types.ObjectId.isValid(postId))
    throw new ApiError(400, "Invalid post Id");

  const tag = await Tag.findOneAndDelete({
    _id: tagId,
    author: req.user._id,
    post: postId,
  });
  if (!tag) throw new ApiError(400, "Tag not found or Invalid User");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Tag Deleted Successfully"));
});
const updateTag = asyncHandler(async (req, res) => {
  const tagId = req.params.tagId;
  const { title } = req.body;
  if (!tagId) throw new ApiError(404, "Tag Id Required");
  if (!mongoose.Types.ObjectId.isValid(tagId))
    throw new ApiError(400, "Invalid Tag Id");
  const postId = req.params.postId;
  if (!postId) throw new ApiError(404, "postId Id Required");
  if (!mongoose.Types.ObjectId.isValid(postId))
    throw new ApiError(400, "Invalid post Id");

  if (!title) throw new ApiError(404, "Tag title Required");
  const tag = await Tag.findOneAndUpdate(
    {
      _id: tagId,
      author: req.user._id,
      post: postId,
    },
    {
      $set: {
        title,
      },
    },
    {
      new: true,
    }
  );
  if (!tag) throw new ApiError(400, "Tag not Found or Invalid User");
  return res
    .status(200)
    .json(new ApiResponse(200, tag, "Tag Updated Successfully"));
});
const getTags = asyncHandler(async (req, res) => {
  const search = req.params.search;
  const tag = await Tag.distinct("title", {
    title: { $regex: search, $options: "i" },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, tag, "Tags Fetched Successfully"));
});
const getTagFilter = asyncHandler(async (req, res) => {
  const { tags } = req.body;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  if (!tags) throw new ApiError(404, "Tag List Required");
  const posts = await Tag.aggregate([
    {
      $match: {
        $or: tags.map((tag) => ({
          title: { $regex: tag, $options: "i" },
        })),
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    { $skip: skip },
    { $limit: limit },

    {
      $lookup: {
        from: "posts",
        localField: "post",
        foreignField: "_id",
        as: "post",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "author",
              foreignField: "_id",
              as: "author",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullname: 1,
                    email: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          { $unwind: "$author" },
          {
            $project: {
              title: 1,
              description: 1,
              author: 1,
              image: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$post" },

    {
      $group: {
        _id: "$post._id",
        post: { $first: "$post" },
        matchedTags: { $addToSet: "$title" },
      },
    },

    {
      $group: {
        _id: null,
        posts: {
          $addToSet: {
            _id: "$post._id",
            title: "$post.title",
            description: "$post.description",
            author: "$post.author",
            image: "$post.image",
            createdAt: "$post.createdAt",
            matchedTags: "$matchedTags",
          },
        },
        postCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        posts: 1,
        postCount: 1,
      },
    },
  ]);

  if (!posts) throw new ApiError(500, "Unable to fetch the posts");
  return res
    .status(200)
    .json(new ApiResponse(200, posts, "Post Fetched Successfully"));
});
export { addTag, deleteTag, getTagFilter, getTags, updateTag };
