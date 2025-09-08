import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const addBookMark = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  if (!postId) throw new ApiError(404, "Post Id Required");
  if (!mongoose.Types.ObjectId.isValid(postId))
    throw new ApiError(400, "Invalid Post id");
  const existedBookmark = await User.findOne({
    _id: req.user._id,
    bookmark: postId,
  });
  if (existedBookmark) throw new ApiError(400, "Bookmarked Already");
  const post = await User.updateOne(
    { _id: req.user._id },
    {
      $addToSet: {
        bookmark: new mongoose.Types.ObjectId(postId),
      },
    }
  );
  if (!post)
    throw new ApiError(400, "Post not Found or Unable to Add Bookmark");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Bookmark Add Sucessfully"));
});
const deleteBookmark = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  if (!postId) throw new ApiError(404, "Post Id Required");
  if (!mongoose.Types.ObjectId.isValid(postId))
    throw new ApiError(400, "Invalid Post id");
  const post = await User.findByIdAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $pull: {
        bookmark: postId,
      },
    },
    { new: true }
  );
  if (!post) throw new ApiError(400, "Post not Found or Invalid User");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Bookmark Deleted Sucessfully"));
});
const getBookmarks = asyncHandler(async (req, res) => {
  const bookmark = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $sort: {
        created: -1,
      },
    },
    {
      $addFields: {
        bookmarkCount: { $size: { $ifNull: ["$bookmark", []] } },
      },
    },
    {
      $facet: {
        metadata: [
          {
            $project: {
              _id: 0,
              bookmarkCount: 1,
            },
          },
        ],
        posts: [
          {
            $lookup: {
              from: "posts",
              localField: "bookmark",
              foreignField: "_id",
              as: "posts",
              pipeline: [
                {
                  $project: {
                    title: 1,
                    content: 1,
                    author: 1,
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
                          avatar: 1,
                          email: 1,
                        },
                      },
                    ],
                  },
                },
                { $unwind: "$author" },
              ],
            },
          },
          { $unwind: "$posts" },
          { $replaceRoot: { newRoot: "$posts" } },
        ],
      },
    },
    {
      $project: {
        bookmarkCount: {
          $arrayElemAt: ["$metadata.bookmarkCount", 0],
        },
        posts: "$posts",
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, bookmark[0], "Bookmarks Fetched Sucessfully"));
});
export { addBookMark, deleteBookmark, getBookmarks };
