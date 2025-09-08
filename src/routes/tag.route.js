import { Router } from "express";
import {
  addTag,
  deleteTag,
  getTagFilter,
  getTags,
  updateTag,
} from "../controllers/tag.controller.js";
import { verifyAuth } from "../middlewares/jwtAuth.middleware.js";
const tagRouter = Router();
tagRouter.post("/:postId/tags", verifyAuth, addTag);
tagRouter.delete("/:postId/tags/:tagId", verifyAuth, deleteTag);
tagRouter.put("/:postId/tags/:tagId", verifyAuth, updateTag);
tagRouter.get("/:search", verifyAuth, getTags);
tagRouter.get("/tag/filter", verifyAuth, getTagFilter);
export { tagRouter };
