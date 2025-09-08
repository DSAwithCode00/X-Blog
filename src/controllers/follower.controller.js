import mongoose from "mongoose";
import { Follower } from "../models/follower.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const addFollower = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) throw new ApiError(404, "User Id Required");
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new ApiError(400, "Invalid User Id");

  if (req.user._id.equals(userId))
    throw new ApiError(400, "You can't follow Yourself");
  const alreadyFollowed = await Follower.findOne({
    channel: userId,
    follower: req.user._id,
  });
  if (alreadyFollowed) throw new ApiError(400, "Already Followed");
  const follow = await Follower.create({
    channel: userId,
    follower: req.user._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, follow, "Followed Successfully"));
});
const removeFollower = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) throw new ApiError(404, "User Id Required");
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new ApiError(400, "Invalid User Id");
  const channel = await Follower.findOneAndDelete({
    channel: userId,
    follower: req.user._id,
  });
  if (!channel) throw new ApiError(400, "Invalid User");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Unfollowed Successfully"));
});

export { addFollower, removeFollower };
