import { Router } from "express";
import {
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
} from "../controllers/user.controller.js";
import { verifyAuth } from "../middlewares/jwtAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const userRouter = Router();
userRouter.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  userRegister
);
userRouter.post("/login", userLogin);
userRouter.post("/logout", verifyAuth, userLogout);
userRouter.post(
  "/update-avatar",
  verifyAuth,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  updateAvatar
);
userRouter.put("/change-password", verifyAuth, changePassword);
userRouter.post("/access-token", updateAccessToken);
userRouter.post("/verify-email", verifyEmail);

userRouter.get("/me", verifyAuth, getUserProfile);
userRouter.get("/:id", verifyAuth, getUserById);
userRouter.get("/by-username/:username", verifyAuth, getUserByUsername);
export { userRouter };
