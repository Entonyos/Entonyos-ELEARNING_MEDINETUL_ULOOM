import TryCatch from "../middlewares/TryCatch.js";
import { Blog } from "../models/Blog.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const uploadDirs = [
    path.join(__dirname, '..', 'uploads'),
    path.join(__dirname, '..', 'uploads', 'blog')
  ];
  
  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Call this when the server starts
ensureUploadDirs();

export const getRecentPosts = TryCatch(async (req, res) => {
  const posts = await Blog.find()
    .sort({ createdAt: -1 })
    .limit(6);

  res.json({
    success: true,
    posts,
  });
});

export const getPostById = TryCatch(async (req, res) => {
  const post = await Blog.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found",
    });
  }

  res.json({
    success: true,
    post,
  });
});

export const createPost = TryCatch(async (req, res) => {
  const { title, summary, content, author } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: "Image is required",
    });
  }

  const post = await Blog.create({
    title,
    summary,
    content,
    author,
    image: file.filename,
  });

  res.status(201).json({
    success: true,
    message: "Blog post created successfully",
    post,
  });
});

export const updatePost = TryCatch(async (req, res) => {
  const { title, summary, content, author } = req.body;
  const file = req.file;

  const post = await Blog.findById(req.params.id);

  if (!post) {
    if (file) await fs.promises.unlink(file.path);
    return res.status(404).json({
      success: false,
      message: "Blog post not found",
    });
  }

  if (file) {
    // Delete old image
    const oldImagePath = path.join(__dirname, '..', 'uploads', 'blog', post.image);
    try {
      if (fs.existsSync(oldImagePath)) {
        await fs.promises.unlink(oldImagePath);
      }
    } catch (error) {
      console.error("Error deleting old image:", error);
    }
    post.image = file.filename;
  }

  post.title = title || post.title;
  post.summary = summary || post.summary;
  post.content = content || post.content;
  post.author = author || post.author;
  post.updatedAt = Date.now();

  await post.save();

  res.json({
    success: true,
    message: "Blog post updated successfully",
    post,
  });
});

export const deletePost = TryCatch(async (req, res) => {
  const post = await Blog.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found",
    });
  }

  // Delete image
  const imagePath = path.join(__dirname, '..', 'uploads', 'blog', post.image);
  try {
    if (fs.existsSync(imagePath)) {
      await fs.promises.unlink(imagePath);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
  }

  await post.deleteOne();

  res.json({
    success: true,
    message: "Blog post deleted successfully",
  });
}); 