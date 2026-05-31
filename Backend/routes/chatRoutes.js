import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getOrCreateChat,
  createGroupChat,
  getUserChats,
  getChatById,
  deleteChat,
} from "../controllers/chatController.js";

const router = express.Router();

// 1-to-1 chat (get existing or create)
router.post("/create", protect, getOrCreateChat);

// Group chat
router.post("/group", protect, createGroupChat);

// Sidebar list (with unread counts)
router.get("/", protect, getUserChats);

// Single chat lookup (used by call history)
router.get("/:chatId", protect, getChatById);

// Delete entire chat + all its messages
router.delete("/:chatId", protect, deleteChat);

export default router;
