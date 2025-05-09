import express from "express";
import {
  register,
  verifyUser,
  loginUser,
  myProfile,
  forgotPassword,
  resetPassword,
  updateProfile,
} from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import { addProgress, getYourProgress } from "../controllers/course.js";

const router = express.Router();

// User routes
router.post("/register", upload.single('image'), register);
router.post("/verify", verifyUser);
router.post("/login", loginUser);
router.get("/me", isAuth, myProfile);
router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);
router.put("/profile/update", isAuth, upload.single('image'), updateProfile);

// Progress routes
router.post("/user/progress", isAuth, addProgress);
router.get("/user/progress", isAuth, getYourProgress);

export default router;
