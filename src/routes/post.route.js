import { Router } from "express";
import { addComment, getComments, removeComment, updateComment } from "../controllers/comment.controller.js";
import { addLike, getLikes, removeLike } from "../controllers/like.controller.js";
import {
  createPost,
  deletePost,
  getBySearch,
  getPostByUser,
  getPosts,
  singlePost,
  updatePost,
} from "../controllers/post.controller.js";
import { verifyAuth } from "../middlewares/jwtAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const postRouter = Router();
// Likes
postRouter.post("/:postId/like", verifyAuth, addLike);
postRouter.delete("/:postId/dislike", verifyAuth, removeLike);
postRouter.get("/:postId/likes", verifyAuth, getLikes);

// Comments
postRouter.post("/:postId/comments", verifyAuth, addComment);
postRouter.get("/:postId/comments", verifyAuth, getComments);
postRouter.put("/comments/:commentId", verifyAuth, updateComment);
postRouter.delete("/comments/:commentId", verifyAuth, removeComment);

// Posts
postRouter.post(
  "/",
  verifyAuth,
  upload.fields([{ name: "image", maxCount: 1 }]),
  createPost
);
postRouter.get("/", verifyAuth, getPosts);
postRouter.get("/search/:title", verifyAuth, getBySearch);
postRouter.get("/me", verifyAuth, getPostByUser);
postRouter.get("/:id", verifyAuth, singlePost);
postRouter.put(
  "/:id",
  verifyAuth,
  upload.fields([{ name: "image", maxCount: 1 }]),
  updatePost
);
postRouter.delete("/:id", verifyAuth, deletePost);

export { postRouter };