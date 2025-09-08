import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const createPost = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  console.log("Title:", title);
  console.log("Description:", description);
  if ([title, description].some((field) => field.trim() === ""))
    throw new ApiError(400, "All Field Required");
  const localImage = req.files?.image?.[0]?.path;
  if (!localImage) throw new ApiError(400, "Image Required");
  const image = await uploadOnCloudinary(localImage);

  if (!image) throw new ApiError(500, "Unable to Load Image");
  const post = await Post.create({
    title,
    description,
    author: req.user._id,
    image: image.secure_url,
  });
  if (!post) throw new ApiError(500, "Failed to Create Post");
  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post Created Successfully"));
});
const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  if (!postId) throw new ApiError(404, "Post Id Required");
  if (!mongoose.Types.ObjectId.isValid(postId))
    throw new ApiError(400, "Invalid Post id");
  const post = await Post.findOneAndDelete({
    _id: postId,
    author: req.user._id,
  });
  if (!post) throw new ApiError(404, "Post Not Found or Invalid User");
  await Promise.all([
    Comment.deleteMany({ post: postId }),
    Like.deleteMany({ post: postId }),
  ]);

  if (!post) throw new ApiError(400, "Invalid User or Post not found");

  await Promise.all([
    Comment.deleteMany({ post: postId }),
    Like.deleteMany({ post: postId }),
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, "Post Deleted Successfully"));
});
const updatePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const { title, description } = req.body || null;
  const imagePath = req.files?.image?.[0]?.path;
  if (!postId) throw new ApiError(404, "Post Id Required");
  if (!mongoose.Types.ObjectId.isValid(postId))
    throw new ApiError(400, "Invalid Post Id");
  const post = await Post.findOne({ _id: postId, author: req.user._id });
  if (!post) throw new ApiError(400, "Post not found or Invalid User");
  if (imagePath) {
    await deleteFromCloudinary(post.image);
    const image = await uploadOnCloudinary(imagePath);
    if (!image) throw new ApiError(500, "Unable to Load Image");
    post.image = image.secure_url;
  }
  if (title) post.title = title;
  if (description) post.description = description;
  await post.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post Updated Successfully"));
});
const singlePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  if (!postId) throw new ApiError(404, "Post Id Required");
  if (!mongoose.Types.ObjectId.isValid(postId))
    throw new ApiError(400, "Invalid Post id");
  const post = await Post.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(postId),
      },
    },
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
              avatar: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$author",
    },
    {
      $lookup: {
        from: "likes",
        let: { postId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$post", "$$postId"],
              },
            },
          },
          {
            $count: "count",
          },
        ],
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "comments",
        let: {
          postId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$post", "$$postId"],
              },
            },
          },
          {
            $count: "count",
          },
        ],
        as: "comments",
      },
    },
    {
      $addFields: {
        likeCount: {
          $ifNull: [{ $arrayElemAt: ["$likes.count", 0] }, 0],
        },
        commentCount: {
          $ifNull: [{ $arrayElemAt: ["$comments.count", 0] }, 0],
        },
      },
    },
    {
      $project: {
        likes: 0,
        comments: 0,
        createdAt: 0,
        __v: 0,
      },
    },
  ]);
  if (!post) throw new ApiError(400, "Invalid User or Post not found");
  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post Fecthed Successfully"));
});
const getPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const posts = await Post.aggregate([
    {
      $facet: {
        metadata: [
          {
            $count: "totalPost",
          },
        ],
        posts: [
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "post",
              as: "likes",
            },
          },
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "post",
              as: "comments",
            },
          },
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
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$author",
          },
          {
            $project: {
              title: 1,
              description: 1,
              image: 1,
              author: 1,
              likesCount: {
                $size: "$likes",
              },
              commentCount: {
                $size: "$comments",
              },
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalPost: {
          $ifNull: [{ $arrayElemAt: ["$metadata.totalPost", 0] }, 0],
        },
      },
    },
    {
      $project: {
        totalPost: 1,
        posts: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, posts[0], "Posts fetched Successfully"));
});
const getBySearch = asyncHandler(async (req, res) => {
  const title = req.params.title;
  if (!title) throw new ApiError(404, "Title Required");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const posts = await Post.aggregate([
    {
      $match: {
        title: {
          $regex: title,
          $options: "i",
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
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
        localField: "author",
        foreignField: "_id",
        as: "author",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$author",
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "post",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "post",
        as: "comments",
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        author: 1,
        image: 1,
        createdAt: 1,
        likes: {
          $size: "$likes",
        },
        comments: {
          $size: "$comments",
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, posts, "Posts Fetched Successfully"));
});
const getPostByUser = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const posts = await Post.aggregate([
    {
      $match: {
        author: req.user._id,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $facet: {
        metadata: [{ $count: "totalPost" }],
        posts: [
          {
            $lookup: {
              from: "comments",
              localField: "_id",
              foreignField: "post",
              as: "comments",
            },
          },
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "post",
              as: "likes",
            },
          },
          {
            $project: {
              title: 1,
              description: 1,
              image: 1,
              comments: {
                $size: "$comments",
              },
              likes: {
                $size: "$likes",
              },
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalPost: { $arrayElemAt: ["$metadata.totalPost", 0] },
      },
    },
    {
      $project: {
        metadata: 0,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, posts[0], "Posts Fetched Successfully"));
});
export {
  createPost,
  deletePost,
  getBySearch,
  getPostByUser,
  getPosts,
  singlePost,
  updatePost,
};
