import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Settings, LogOut, UserCircle, MessageCircle, Pencil,
  UserPlus, UserCheck, UserMinus, Grid, Image as ImageIcon,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import API from "../services/api";
import FloatingNav from "../components/FloatingNav";
import { useAuth } from "../context/AuthContext";
import LazyImage from "../components/LazyImage";
import PostModal from "../components/PostModal";
import EditProfileModal from "../components/EditProfileModal";
import CreatePostModal from "../components/CreatePostModal";

// ─── FollowButton ─────────────────────────────────────────────────────────────
function FollowButton({ profileId, initialFollowing, onFollowChange, isDark }) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setIsFollowing(initialFollowing); }, [initialFollowing]);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    const next = !isFollowing;
    setIsFollowing(next);
    try {
      const endpoint = next ? `/users/${profileId}/follow` : `/users/${profileId}/unfollow`;
      const res = await API.put(endpoint);
      onFollowChange?.(next, res.data.followersCount);
    } catch (err) {
      setIsFollowing(!next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={loading}
      className="relative flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border"
      style={{
        backgroundColor: isFollowing 
          ? (isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9") 
          : (isDark ? "#ffffff" : "#0f172a"),
        color: isFollowing 
          ? (isDark ? "#a1a1aa" : "#64748b") 
          : (isDark ? "#0f172a" : "#ffffff"),
        borderColor: isFollowing ? (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0") : "transparent"
      }}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : isFollowing ? (
        hovered ? <><UserMinus size={14} /> Unfollow</> : <><UserCheck size={14} /> Following</>
      ) : (
        <><UserPlus size={14} /> Follow</>
      )}
    </motion.button>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function Profile() {
  const { id } = useParams();
  const { user: loggedUser, theme } = useAuth();
  const isDark = theme === "dark";

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [visiblePosts, setVisiblePosts] = useState(12);
  const [followerCount, setFollowerCount] = useState(0);

  const loaderRef = useRef(null);
  const menuRef = useRef(null);

  const profileId = id === "me" ? loggedUser?._id : id;
  const isOwnProfile = loggedUser?._id === profileId;

  const isFollowing = user?.followers?.some(
    (f) => (f._id || f).toString() === loggedUser?._id?.toString()
  ) ?? false;

  useEffect(() => {
    if (!profileId) return;
    (async () => {
      try {
        const [userRes, postsRes] = await Promise.all([
          API.get(`/users/${profileId}`),
          API.get("/posts/feed"),
        ]);
        setUser(userRes.data);
        setFollowerCount(userRes.data.followers?.length || 0);
        setPosts(postsRes.data.posts.filter((p) => p.user._id === profileId));
      } catch (err) { console.error(err); }
    })();
  }, [profileId]);

  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    }
    catch (err) { console.error(err); }
    finally {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const handleDeletePost = async (postId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this post?")) return;
    try {
      await API.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      if (selectedPost?._id === postId) setSelectedPost(null);
    } catch (err) { console.error(err); }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
      <div className={`w-10 h-10 border-4 rounded-full animate-spin ${isDark ? 'border-white/20 border-t-white' : 'border-slate-200 border-t-slate-900'}`} />
    </div>
  );

  return (
    <div className="relative min-h-screen transition-colors duration-500 overflow-hidden" style={{ backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
      <FloatingNav />
      
      {/* ── AMBIENT BACKGROUND BLOBS ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft Mint Blob - High visibility in light mode */}
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-5%] left-[-10%] w-[55vw] h-[55vw] rounded-full blur-[100px]"
          style={{ 
            background: isDark 
              ? "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)" 
              : "radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 75%)" 
          }}
        />
        
        {/* Soft Amber Blob - Swapped peach for amber for higher visibility */}
        <motion.div
          animate={{
            x: [0, -70, 60, 0],
            y: [0, 90, -50, 0],
            scale: [1, 1.2, 1, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-5%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[110px]"
          style={{ 
            background: isDark 
              ? "radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)" 
              : "radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 75%)" 
          }}
        />

        {/* Center Lavender Glow */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-20">
        
        <div className="flex flex-col gap-10 mb-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 shadow-2xl transition-colors duration-500" style={{ borderColor: isDark ? "#1e293b" : "#ffffff" }}>
                <img src={user.avatar || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt={user.name} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left pb-2">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h2 className="text-3xl sm:text-4xl font-serif leading-none break-words" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>{user.name}</h2>
                <div className="flex items-center justify-center gap-2" ref={menuRef}>
                  {!isOwnProfile ? (
                    <FollowButton profileId={profileId} initialFollowing={isFollowing} onFollowChange={(_, count) => setFollowerCount(count)} isDark={isDark} />
                  ) : null}
                  
                  <button 
                    onClick={() => setShowMenu(!showMenu)} 
                    className="p-2.5 rounded-xl border shadow-sm transition-all"
                    style={{ 
                      backgroundColor: isDark ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.6)", 
                      borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
                      color: isDark ? "#94a3b8" : "#64748b",
                      backdropFilter: "blur(10px)"
                    }}
                  >
                    <Settings size={18} />
                  </button>
                  
                  <AnimatePresence>
                    {showMenu && isOwnProfile && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} 
                        className="absolute mt-48 w-56 border rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                        style={{ backgroundColor: isDark ? "#0f172a" : "#ffffff", borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0" }}
                      >
                        <button
                          onClick={() => { setShowMenu(false); setShowEditModal(true); }}
                          className={`w-full px-5 py-3.5 flex items-center gap-3 text-sm font-bold transition-colors ${
                            isDark ? "text-slate-200 hover:bg-white/5" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <Pencil size={17} /> Edit profile
                        </button>
                        <div className={isDark ? "h-px bg-white/10 mx-3" : "h-px bg-slate-100 mx-3"} />
                        <button onClick={handleLogout} className="w-full px-5 py-3.5 hover:bg-red-500/10 text-red-500 flex items-center gap-3 text-sm font-bold transition-colors">
                           <LogOut size={18} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 font-medium text-[13px]" style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500" /> {user.city || 'local'}</span>
              </div>
            </div>
          </div>

          <div 
            className="grid grid-cols-3 backdrop-blur-xl border rounded-[2rem] shadow-sm overflow-hidden transition-colors duration-500"
            style={{ 
              backgroundColor: isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(255, 255, 255, 0.4)", 
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" 
            }}
          >
            {[
              { value: posts.length, label: "Posts" },
              { value: followerCount, label: "Followers" },
              { value: user.following?.length || 0, label: "Following" },
            ].map((stat, idx) => (
              <div key={idx} className="py-4 sm:py-6 flex flex-col items-center justify-center transition-colors min-w-0" style={{ borderRight: idx !== 2 ? (isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)") : "none" }}>
                <p className="text-xl sm:text-2xl font-black" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>{stat.value}</p>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.2em] text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mb-8">
          <div 
            className="flex items-center gap-4 p-1.5 rounded-2xl border shadow-sm transition-colors duration-500"
            style={{ 
              backgroundColor: isDark ? "rgba(30, 41, 59, 0.3)" : "rgba(255, 255, 255, 0.3)", 
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              backdropFilter: "blur(10px)"
            }}
          >
            <button 
              className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all"
              style={{ 
                backgroundColor: isDark ? "#ffffff" : "#0f172a", 
                color: isDark ? "#0f172a" : "#ffffff" 
              }}
            >
              <Grid size={14} /> Posts
            </button>
          </div>
          {isOwnProfile && (
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
              onClick={() => setShowCreatePost(true)} 
              className="p-3 rounded-full shadow-xl transition-all"
              style={{ 
                backgroundColor: isDark ? "#ffffff" : "#0f172a", 
                color: isDark ? "#0f172a" : "#ffffff" 
              }}
            >
              <ImageIcon size={20} />
            </motion.button>
          )}
        </div>

        {posts.length === 0 ? (
          <div 
            className="py-24 flex flex-col items-center rounded-[3rem] border border-dashed transition-colors backdrop-blur-sm"
            style={{ backgroundColor: isDark ? "rgba(30, 41, 59, 0.2)" : "rgba(255, 255, 255, 0.2)", borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
          >
            <Grid className={isDark ? "text-slate-800" : "text-slate-200"} size={64} />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No stories yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {posts.slice(0, visiblePosts).map((post) => (
              <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={() => setSelectedPost(post)} className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all" style={{ backgroundColor: isDark ? "#1e293b" : "#f1f5f9" }}>
                <LazyImage src={post.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 backdrop-blur-[2px]">
                   <span className="flex items-center gap-2 text-white font-black text-sm">
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                     {post.likes?.length || 0}
                   </span>
                </div>
                {isOwnProfile && (
                  <button onClick={(e) => handleDeletePost(post._id, e)} className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
        <div ref={loaderRef} className="h-10" />
      </div>

      <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} onDeleted={(postId) => { setPosts(prev => prev.filter(p => p._id !== postId)); setSelectedPost(null); }} onUpdated={(upd) => { setPosts(prev => prev.map(p => p._id === upd._id ? upd : p)); setSelectedPost(upd); }} />
      <AnimatePresence>
        {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} onPosted={(newPost) => { setPosts(prev => [newPost, ...prev]); setShowCreatePost(false); }} />}
      </AnimatePresence>
      {showEditModal && <EditProfileModal user={user} onClose={() => setShowEditModal(false)} onUpdated={(upd) => { setUser(upd); setFollowerCount(upd.followers?.length || 0); }} />}
    </div>
  );
}

export default Profile;
