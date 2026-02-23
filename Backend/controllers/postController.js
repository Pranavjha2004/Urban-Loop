import Post from "../models/Post.js";

export const createPost = async (req, res) => {
  const post = await Post.create({
    user: req.user._id,
    caption: req.body.caption,
    image: req.body.image,
    city: req.user.city,
  });

  res.status(201).json(post);
};



export const getPosts = async (req, res) => {
  const posts = await Post.find()
    .populate("user", "name username avatar")
    .sort({ createdAt: -1 });

  res.json(posts);
};


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