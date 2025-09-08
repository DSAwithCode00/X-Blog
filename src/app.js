import cookieParser from "cookie-parser";
import express from "express";
import { bookmarkRouter } from "./routes/bookmark.route.js";
import { followerRouter } from "./routes/follower.route.js";
import { postRouter } from "./routes/post.route.js";
import { tagRouter } from "./routes/tag.route.js";
import { userRouter } from "./routes/user.route.js";
const app = express();
app.use(cookieParser());
app.use(express.urlencoded());
app.use(express.json());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/tags",tagRouter);
app.use("/api/v1/bookmarks", bookmarkRouter);
app.use("/api/v1/followers", followerRouter); 

export { app };

