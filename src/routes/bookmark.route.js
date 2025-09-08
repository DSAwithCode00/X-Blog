import { Router } from "express";
import {
    addBookMark,
    deleteBookmark,
    getBookmarks,
} from "../controllers/bookmark.controller.js";
import { verifyAuth } from "../middlewares/jwtAuth.middleware.js";
const bookmarkRouter = Router();
bookmarkRouter.post("/bookmark/:postId", verifyAuth, addBookMark);
bookmarkRouter.delete("/bookmark/:postId", verifyAuth, deleteBookmark);
bookmarkRouter.get("/bookmark",verifyAuth,getBookmarks)
export { bookmarkRouter };