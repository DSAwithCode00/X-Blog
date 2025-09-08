import { Router } from "express";
import {
    addFollower,
    removeFollower,
} from "../controllers/follower.controller.js";
import { verifyAuth } from "../middlewares/jwtAuth.middleware.js";
const followerRouter = Router();
followerRouter.post("/follow/:userId", verifyAuth, addFollower);
followerRouter.delete("/follow/:userId", verifyAuth, removeFollower);
export { followerRouter };

