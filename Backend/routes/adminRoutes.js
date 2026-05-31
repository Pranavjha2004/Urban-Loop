import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import Community from "../models/Community.js";
import CallLog from "../models/CallLog.js";

const router = express.Router();
router.use(protect, adminOnly);

const sinceDays = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

router.get("/analytics", async (_req, res) => {
  try {
    const [totalUsers, suspendedUsers, totalPosts, hiddenPosts, totalMessages, totalChats, totalCommunities, callStats, recentUsers, topUsers, postsByDay, loginsByDay, callsByType] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      User.countDocuments({ isSuspended: true, deletedAt: null }),
      Post.countDocuments({ deletedAt: null }),
      Post.countDocuments({ deletedAt: { $ne: null } }),
      Message.countDocuments({ deletedForEveryone: { $ne: true } }),
      Chat.countDocuments(),
      Community.countDocuments(),
      CallLog.aggregate([{ $group: { _id: null, count: { $sum: 1 }, duration: { $sum: "$duration" } } }]),
      User.find({ deletedAt: null }).select("name username email city role loginCount lastLoginAt createdAt isSuspended").sort({ createdAt: -1 }).limit(8).lean(),
      User.aggregate([
        { $match: { deletedAt: null } },
        { $lookup: { from: "posts", localField: "_id", foreignField: "user", as: "posts" } },
        { $lookup: { from: "calllogs", localField: "_id", foreignField: "participants.user", as: "calls" } },
        {
          $project: {
            name: 1, username: 1, email: 1, city: 1, role: 1, loginCount: 1,
            postCount: { $size: { $filter: { input: "$posts", as: "post", cond: { $eq: ["$$post.deletedAt", null] } } } },
            callCount: { $size: "$calls" },
            callDuration: { $sum: "$calls.duration" },
          },
        },
        { $sort: { postCount: -1, callCount: -1, loginCount: -1 } },
        { $limit: 8 },
      ]),
      Post.aggregate([
        { $match: { createdAt: { $gte: sinceDays(13) }, deletedAt: null } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { lastLoginAt: { $gte: sinceDays(13) } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastLoginAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      CallLog.aggregate([{ $group: { _id: "$type", count: { $sum: 1 }, duration: { $sum: "$duration" } } }]),
    ]);

    res.json({
      summary: {
        totalUsers, suspendedUsers, totalPosts, hiddenPosts, totalMessages, totalChats, totalCommunities,
        totalCalls: callStats[0]?.count || 0,
        totalCallDuration: callStats[0]?.duration || 0,
      },
      recentUsers, topUsers, postsByDay, loginsByDay, callsByType, generatedAt: new Date(),
    });
  } catch (err) {
    console.error("admin analytics error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/users", async (req, res) => {
  const search = req.query.search?.trim();
  const query = {
    deletedAt: null,
    ...(search ? { $or: [
      { name: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
    ] } : {}),
  };
  const users = await User.find(query).select("-password").sort({ createdAt: -1 }).limit(100).lean();
  const ids = users.map((u) => u._id);
  const [postCounts, callCounts] = await Promise.all([
    Post.aggregate([{ $match: { user: { $in: ids }, deletedAt: null } }, { $group: { _id: "$user", count: { $sum: 1 } } }]),
    CallLog.aggregate([{ $match: { "participants.user": { $in: ids } } }, { $unwind: "$participants" }, { $match: { "participants.user": { $in: ids } } }, { $group: { _id: "$participants.user", count: { $sum: 1 }, duration: { $sum: "$duration" } } }]),
  ]);
  const posts = Object.fromEntries(postCounts.map((x) => [x._id.toString(), x.count]));
  const calls = Object.fromEntries(callCounts.map((x) => [x._id.toString(), x]));
  res.json(users.map((u) => ({ ...u, postCount: posts[u._id.toString()] || 0, callCount: calls[u._id.toString()]?.count || 0, callDuration: calls[u._id.toString()]?.duration || 0 })));
});

router.patch("/users/:id/suspend", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ message: "Admin cannot be suspended" });
  user.isSuspended = true;
  user.suspendedAt = new Date();
  await user.save();
  res.json({ success: true });
});

router.patch("/users/:id/restore", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isSuspended = false;
  user.suspendedAt = undefined;
  await user.save();
  res.json({ success: true });
});

router.delete("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ message: "Admin cannot be deleted" });
  await Promise.all([
    Post.updateMany({ user: user._id }, { $set: { deletedAt: new Date(), deletedBy: req.user._id, deleteReason: "User removed by admin" } }),
    Message.updateMany({ sender: user._id }, { $set: { deletedForEveryone: true, text: "" } }),
  ]);
  await user.deleteOne();
  res.json({ success: true });
});

router.get("/posts", async (req, res) => {
  const search = req.query.search?.trim();
  const query = search ? { caption: { $regex: search, $options: "i" } } : {};
  const posts = await Post.find(query).populate("user", "name username email avatar").populate("deletedBy", "name username").sort({ createdAt: -1 }).limit(120).lean();
  res.json(posts);
});

router.patch("/posts/:id/hide", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  post.deletedAt = new Date();
  post.deletedBy = req.user._id;
  post.deleteReason = req.body.reason || "Hidden by admin";
  await post.save();
  res.json({ success: true });
});

router.patch("/posts/:id/restore", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  post.deletedAt = null;
  post.deletedBy = undefined;
  post.deleteReason = "";
  await post.save();
  res.json({ success: true });
});

router.delete("/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  await post.deleteOne();
  res.json({ success: true });
});

export default router;
