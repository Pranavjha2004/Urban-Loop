import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getMyProfile,
  getUserProfile,
  followUser,
  unfollowUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.get("/:id", protect, getUserProfile);
router.put("/follow/:id", protect, followUser);
router.put("/unfollow/:id", protect, unfollowUser);

export default router;