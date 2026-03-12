import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js"; // 🔥 MISSING IMPORT

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// 🔐 Protected route
router.get("/me", protect, getMe);

// 🔓 Logout route
router.post("/logout", logoutUser);

export default router;