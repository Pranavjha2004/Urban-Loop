import { useEffect, useState, useRef, useCallback } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, X, Bold, Italic } from "lucide-react";
import StarBackground from "../components/StarBackground";
import FloatingNav from "../components/FloatingNav";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [burstPostId, setBurstPostId] = useState(null);
  const [lastTap, setLastTap] = useState(0);

  const [writeModalPost, setWriteModalPost] = useState(null);
  const [readModalPost, setReadModalPost] = useState(null);

  const [commentText, setCommentText] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const observer = useRef();

  // ================= Fetch Posts =================
  const fetchPosts = async () => {
    if (!hasMore || loading) return;
    setLoading(true);

    try {
      const res = await API.get(`/posts/feed?page=${page}&limit=5`);
      setPosts((prev) => [...prev, ...res.data.posts]);
      setHasMore(res.data.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ================= Infinite Scroll =================
  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // ================= Like =================
  const handleLike = async (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: p.likedByUser
                ? p.likes.slice(0, -1)
                : [...p.likes, "temp"],
              likedByUser: !p.likedByUser,
            }
          : p
      )
    );

    try {
      await API.put(`/posts/like/${postId}`);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= Double Tap =================
  const handleDoubleTap = (postId) => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      handleLike(postId);
      setBurstPostId(postId);
      setTimeout(() => setBurstPostId(null), 800);
    }
    setLastTap(now);
  };

  // ================= Add Comment =================
  const handleAddComment = async () => {
    if (!commentText.trim() || !writeModalPost) return;

    const formattedText = `
${isBold ? "**" : ""}${isItalic ? "_" : ""}${commentText}${
      isItalic ? "_" : ""
    }${isBold ? "**" : ""}
`;

    try {
      const res = await API.post(
        `/posts/comment/${writeModalPost._id}`,
        { text: formattedText }
      );

      setPosts((prev) =>
        prev.map((p) =>
          p._id === writeModalPost._id
            ? { ...p, comments: res.data }
            : p
        )
      );

      setCommentText("");
      setIsBold(false);
      setIsItalic(false);
      setWriteModalPost(null);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-hidden">
      <StarBackground />
      <FloatingNav />

      <div className="relative z-10 flex justify-center px-4 pt-28 pb-10">
        <div className="w-full max-w-xl space-y-8">

          {posts.map((post, index) => {
            const isLast = posts.length === index + 1;

            return (
              <motion.div
                ref={isLast ? lastPostRef : null}
                key={post._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-xl overflow-hidden"
              >
                {/* User */}
                <div className="flex items-center gap-3 p-4">
                  <Link to={`/profile/${post.user._id}`}>
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {post.user?.name?.charAt(0)}
                    </div>
                  </Link>

                  <Link
                    to={`/profile/${post.user._id}`}
                    className="text-white font-semibold hover:text-purple-400"
                  >
                    {post.user?.name}
                  </Link>
                </div>

                {/* Image */}
                {post.image && (
                  <div
                    className="relative cursor-pointer"
                    onClick={() => handleDoubleTap(post._id)}
                  >
                    <img
                      src={post.image}
                      alt="post"
                      className="w-full object-cover max-h-[500px]"
                    />

                    <AnimatePresence>
                      {burstPostId === post._id && (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1.4, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <Heart size={110} fill="white" className="text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-5 px-4 py-3 text-zinc-400">
                  <motion.button
                    whileTap={{ scale: 1.3 }}
                    animate={{ scale: post.likedByUser ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-2 ${
                      post.likedByUser
                        ? "text-red-500"
                        : "hover:text-red-500"
                    }`}
                  >
                    <Heart
                      size={20}
                      fill={post.likedByUser ? "currentColor" : "none"}
                    />
                    {post.likes.length}
                  </motion.button>

                  {/* Write Comment Modal Trigger */}
                  <button
                    onClick={() => setWriteModalPost(post)}
                    className="flex items-center gap-2 hover:text-purple-400 transition"
                  >
                    <MessageCircle size={20} />
                    {post.comments.length}
                  </button>
                </div>

                {/* Caption */}
                <div className="px-4 pb-2 text-sm text-white">
                  <span className="font-semibold mr-2">
                    {post.user?.name}
                  </span>
                  {post.caption}
                </div>

                {/* Top 3 Comments */}
                <div className="px-4 pb-4 text-sm text-zinc-400 space-y-1">
                  {post.comments.slice(0, 3).map((c, i) => (
                    <p key={i}>
                      <span className="text-purple-400 font-medium mr-1">
                        {c.user?.name || "User"}:
                      </span>
                      {c.text}
                    </p>
                  ))}

                  {post.comments.length > 3 && (
                    <button
                      onClick={() => setReadModalPost(post)}
                      className="text-zinc-500 hover:text-white text-sm mt-2"
                    >
                      View all {post.comments.length} comments
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ================= WRITE COMMENT MODAL ================= */}
      <AnimatePresence>
        {writeModalPost && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setWriteModalPost(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
            >
              <div className="flex justify-between mb-4">
                <h3 className="text-white font-semibold">Write Comment</h3>
                <X
                  className="text-zinc-400 cursor-pointer"
                  onClick={() => setWriteModalPost(null)}
                />
              </div>

              <div className="flex gap-3 mb-3 text-zinc-400">
                <button onClick={() => setIsBold(!isBold)}>
                  <Bold size={18} />
                </button>
                <button onClick={() => setIsItalic(!isItalic)}>
                  <Italic size={18} />
                </button>
              </div>

              <textarea
                rows="4"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className={`w-full bg-zinc-800 text-white rounded-lg p-3 text-sm outline-none ${
                  isBold ? "font-bold" : ""
                } ${isItalic ? "italic" : ""}`}
                placeholder="Share your thoughts..."
              />

              <button
                onClick={handleAddComment}
                className="mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-2 rounded-lg text-white font-semibold"
              >
                Post Comment
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= READ COMMENTS MODAL ================= */}
      <AnimatePresence>
        {readModalPost && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReadModalPost(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-h-[70vh] overflow-y-auto"
            >
              <div className="flex justify-between mb-4">
                <h3 className="text-white font-semibold">All Comments</h3>
                <X
                  className="text-zinc-400 cursor-pointer"
                  onClick={() => setReadModalPost(null)}
                />
              </div>

              {readModalPost.comments.map((c, i) => (
                <p key={i} className="text-sm text-zinc-300 mb-2">
                  <span className="text-purple-400 font-medium mr-1">
                    {c.user?.name || "User"}:
                  </span>
                  {c.text}
                </p>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Feed;