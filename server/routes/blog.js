import express from "express";
import {
  getRecentPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/blog.js";
import { isAuth, isAdmin } from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// Public routes
router.get("/blog/recent", getRecentPosts);
router.get("/blog/:id", getPostById);

// Admin routes
router.post("/blog", isAuth, isAdmin, upload.single('image'), createPost);
router.put("/blog/:id", isAuth, isAdmin, upload.single('image'), updatePost);
router.delete("/blog/:id", isAuth, isAdmin, deletePost);

export default router; 