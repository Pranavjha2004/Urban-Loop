import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createPost,
  getPosts,
  deletePost,
  likePost,
  addComment,
} from "../controllers/postController.js";
import { getFeedPosts } from "../controllers/postController.js";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", protect, getPosts);
router.delete("/:id", protect, deletePost);
router.put("/like/:id", protect, likePost);
router.post("/comment/:id", protect, addComment);
router.get("/feed", protect, getFeedPosts);


export default router;