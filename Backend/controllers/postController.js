import Post from "../models/Post.js";

// Create Post
export const createPost = async (req, res) => {
  const post = await Post.create({
    user: req.user._id,
    caption: req.body.caption,
    image: req.body.image,
    city: req.user.city,
  });

  res.status(201).json(post);
};

// Get Post
export const getPosts = async (req, res) => {
  const posts = await Post.find()
    .populate("user", "name username avatar")
    .sort({ createdAt: -1 });

  res.json(posts);
};

// Delete Post
export const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Not authorized" });
  }

  await post.deleteOne();

  res.json({ message: "Post deleted" });
};


// Like Unlike Post
export const likePost = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const alreadyLiked = post.likes.includes(req.user._id);

  if (alreadyLiked) {
    // Unlike
    post.likes = post.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
  } else {
    // Like
    post.likes.push(req.user._id);
  }

  await post.save();

  res.json({
    message: alreadyLiked ? "Post unliked" : "Post liked",
    likesCount: post.likes.length,
  });
};

// Add Comments
export const addComment = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const comment = {
    user: req.user._id,
    text: req.body.text,
  };

  post.comments.push(comment);

  await post.save();

  res.json(post.comments);
};

//get Feed posts
export const getFeedPosts = async (req, res) => {
  const user = req.user;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  const skip = (page - 1) * limit;

  const posts = await Post.find({
    $or: [
      { user: { $in: user.following } },
      { city: user.city },
    ],
  })
    .populate("user", "name username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPosts = await Post.countDocuments({
    $or: [
      { user: { $in: user.following } },
      { city: user.city },
    ],
  });

  res.json({
    page,
    totalPages: Math.ceil(totalPosts / limit),
    totalPosts,
    posts,
  });
};