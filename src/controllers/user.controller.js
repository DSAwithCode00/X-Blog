import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { verifyEmailHtml } from "../lib/email.template.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { transporter } from "../utils/email.js";
const cookieOptions = {
  httpOnly: true,
  secure: true,
};
const sendVerficationCode = async function (email, verificationCode) {
  try {
    await transporter.sendMail({
      from: `"X Blog" dsawithcode00@gmail.com`,
      to: email,
      subject: "Verify Your Email",
      text: "Verify Your Email",
      html: verifyEmailHtml
        .replaceAll("{code}", verificationCode)
        .replace(`{appUrl}`, process.env.APP_LOCATION),
    });
  } catch (error) {
    throw new ApiError(500, error?.message || "Internal Server Error");
  }
};
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token",
      error
    );
  }
};

const userRegister = asyncHandler(async (req, res) => {
  const { email, password, username, fullname } = req.body;

  if (
    [email, password, username, fullname].some((field) => field?.trim() === "")
  )
    throw new ApiError(400, "All Fields are Required");
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser)
    throw new ApiError(400, "User with Email or Username Already Exists");
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const otpExpiry = Date.now() + 10 * 60 * 1000;
  const localAvatar = req.files?.avatar?.[0]?.path;
  if (!localAvatar) throw new ApiError(400, "Avatar Required");

  const avatar = await uploadOnCloudinary(localAvatar);
  if (!avatar) throw new ApiError(500, "Unable to Load Avatar Image");
  const user = await User.create({
    username,
    password,
    email,
    fullname,
    avatar: avatar.secure_url,
    verificationCode,
    verificationCodeExpires: otpExpiry,
  });
  const createdUser = await User.findById(user._id).select(
    "_id fullname username email avatar isVerfied"
  );
  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registering user");
  sendVerficationCode(user.email, user.verificationCode);
  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User Register Successfully"));
});
const verifyEmail = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw new ApiError(404, "OTP Code Required");
  const user = await User.findOne({
    verificationCode: code,
  });
  if (!user) throw new ApiError(400, "User not Found");
  if (user.verificationCode !== code) throw new ApiError(400, "Invalid OTP");
  if (Date.now() > user.verificationCodeExpires)
    throw new ApiError(400, "OTP expired");
  user.isVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpires = null;
  await user.save({ validateBeforeSave: false });
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );
  const registerUser = await User.findById(user._id).select(
    "_id fullname username email avatar"
  );
  return res
    .status(200)
    .cookie("AccessToken", accessToken, cookieOptions)
    .cookie("RefreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, registerUser, "User Logged In Successfully"));
});
const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!(email && password))
    throw new ApiError(400, "Email or Password Must Required");
  const user = await User.findOne({
    email,
  });
  if (!user.isVerified) throw new ApiError(400, "Verify Email First");
  if (!user) throw new ApiError(404, "User doesn't found");
  const checkPassword = await user.isPasswordCorrect(password);
  if (!checkPassword) throw new ApiError(400, "Password Incorrect");
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );
  const LoggedUser = await User.findById(user._id).select(
    "_id email username fullname avatar createdAt"
  );
  return res
    .status(200)
    .cookie("AccessToken", accessToken, cookieOptions)
    .cookie("RefreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, LoggedUser, "User Logged In Successfully"));
});
const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("AccessToken", cookieOptions)
    .clearCookie("RefreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "User Logout Successfully"));
});
const updateAvatar = asyncHandler(async (req, res) => {
  const newAvatarPath = req.files?.avatar?.[0]?.path;
  if (!newAvatarPath) throw new ApiError(404, "Avatar is Required");
  const user = await User.findById(req.user._id);
  const oldAvatar = user.avatar;
  await deleteFromCloudinary(oldAvatar);
  const avatar = await uploadOnCloudinary(newAvatarPath);
  user.avatar = avatar.secure_url;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Avatar Updated Successfully"));
});
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if ([oldPassword, newPassword].some((field) => field.trim() === ""))
    throw new ApiError(400, "All Fields must Required");
  const user = await User.findById(req.user._id);
  const checkPassword = await user.isPasswordCorrect(oldPassword);
  if (!checkPassword) throw new ApiError(400, "Password Incorrect");
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password Changed Successfully"));
});
const updateAccessToken = asyncHandler(async (req, res) => {
  const cookieRefreshToken =
    req.cookies?.RefreshToken || req.body?.RefreshToken;

  if (!cookieRefreshToken) throw new ApiError(401, "Unauthorized Request");
  try {
    const decodeToken = await jwt.verify(
      cookieRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodeToken?._id);
    if (!user)
      throw new ApiError(
        401,
        "Refresh token mismatch or Invalid refresh token"
      );
    if (cookieRefreshToken !== user.refreshToken)
      throw new ApiError(
        401,
        "Refresh token mismatch or Invalid refresh token"
      );
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );
    return res
      .status(200)
      .cookie("AccessToken", accessToken, cookieOptions)
      .cookie("RefreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, null, "Access Refreshed Successfully"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  if (!userId) throw new ApiError(404, "User Id Required");
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new ApiError(400, "Invalid User Id");
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "author",
        as: "posts",
        pipeline: [
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $limit: 10,
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
              image: 1,
              likes: {
                $size: {
                  $ifNull: ["$likes", []],
                },
              },
              comments: {
                $size: {
                  $ifNull: ["$comments", []],
                },
              },
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "channel",
        as: "followers",
      },
    },
    {
      $addFields: {
        postCount: {
          $size: "$posts",
        },
        followerCount: {
          $size: "$followers",
        },
        isFollowed: {
          $in: [new mongoose.Types.ObjectId(userId), "$followers.follower"],
        },
      },
    },
    {
      $project: {
        email: 1,
        username: 1,
        avatar: 1,
        posts: 1,
        postCount: 1,
        followerCount: 1,
        isFollowed: 1,
      },
    },
  ]);
  if (!user) throw new ApiError(404, "User not Found");
  return res
    .status(200)
    .json(new ApiResponse(200, user[0], "User Data Fetched Successfully"));
});
const getUserByUsername = asyncHandler(async (req, res) => {
  const username = req.params.username;
  if (!username) throw new ApiError(404, "Username Required");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const users = await User.aggregate([
    {
      $match: {
        username: {
          $regex: username,
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
      $project: {
        fullname: 1,
        email: 1,
        username: 1,
        avatar: 1,
      },
    },
  ]);
  if (!users) throw new ApiError(404, "Users Not Found");
  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users Fetched Successfully"));
});
const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  console.log("User Id:", userId);
  const userProfile = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "bookmark",
        foreignField: "_id",
        as: "bookmark",
        pipeline: [
          {
            $project: {
              title: 1,
              description: 1,
              image: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "posts",
        let: {
          authorId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$author", "$$authorId"],
              },
            },
          },
          {
            $facet: {
              metadata: [
                {
                  $count: "totalPosts",
                },
              ],
              posts: [
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
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
                    totalComments: {
                      $size: "$comments",
                    },
                    totalLikes: {
                      $size: "$likes",
                    },
                    createdAt: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              totalPosts: { $first: "$metadata.totalPosts" },
              posts: 1,
            },
          },
        ],
        as: "postSet",
      },
    },
    {
      $unwind: "$postSet",
    },
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "follower",
        as: "followed",
      },
    },
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "channel",
        as: "followers",
      },
    },
    {
      $addFields: {
        posts: "$postSet.posts",
        totalPosts: {
          $ifNull: [{ $first: "$postSet.totalPosts" }, 0],
        },
        followedCount: {
          $size: "$followed",
        },
        followerCount: {
          $size: "$followers",
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        email: 1,
        avatar: 1,
        posts: 1,
        totalPosts: 1,
        bookmark: 1,
        totalBookmark: {
          $size: "$bookmark",
        },
        followedCount: 1,
        followerCount: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, userProfile, "User Data Fetched Successfully"));
});
export {
  changePassword,
  getUserById,
  getUserByUsername,
  getUserProfile,
  updateAccessToken,
  updateAvatar,
  userLogin,
  userLogout,
  userRegister,
  verifyEmail,
};
