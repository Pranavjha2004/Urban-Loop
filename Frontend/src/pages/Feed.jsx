import { useEffect, useState, useRef, useCallback } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, MessageCircle, Send, Bookmark, Plus,
  TrendingUp, Droplets, Wind, Search, X, Users, MapPin, LayoutGrid,
} from "lucide-react";
import FloatingNav from "../components/FloatingNav";
import { useAuth } from "../context/AuthContext";

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Weather/news cache — 10 min TTL ──────────────────────────────────────────
// Wraps the existing /api/explore/:city call.
// Memory layer  → survives re-renders within the same session
// localStorage  → survives page reloads within 10 minutes
// No backend changes needed — same endpoint as before.
const EXPLORE_TTL = 10 * 60 * 1000;
const _memCache   = {};

function _lsRead(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (Date.now() - p.fetchedAt > EXPLORE_TTL) { localStorage.removeItem(key); return null; }
    return p;
  } catch { return null; }
}

function _lsWrite(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, fetchedAt: Date.now() })); } catch { /* quota */ }
}

async function getExploreData(city) {
  const k   = `explore_${city.toLowerCase()}`;
  const mem = _memCache[k];
  if (mem && Date.now() - mem.fetchedAt < EXPLORE_TTL) return mem.data;
  const ls = _lsRead(k);
  if (ls) { _memCache[k] = ls; return ls.data; }
  // Same call as original — no backend change
  const res  = await API.get(`/explore/${city}`);
  _memCache[k] = { data: res.data, fetchedAt: Date.now() };
  _lsWrite(k, res.data);
  return res.data;
}

// ── Filter pills config ───────────────────────────────────────────────────────
const FILTERS = [
  { id: "all",       label: "All",       icon: LayoutGrid },
  { id: "following", label: "Following", icon: Users      },
  { id: "nearby",    label: "Nearby",    icon: MapPin     },
];

function Feed() {
  const navigate    = useNavigate();
  const { user: loggedUser, theme } = useAuth();
  const isDark = theme === "dark";

  const [posts,       setPosts]      = useState([]);
  const [loading,     setLoading]    = useState(false);
  const [hasMore,     setHasMore]    = useState(true);
  const [burstPostId, setBurstPostId] = useState(null);
  const [lastTap,     setLastTap]    = useState(0);
  const [filter,      setFilter]     = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [exploreData, setExploreData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [writeModalPost, setWriteModalPost] = useState(null);
  const [commentText,    setCommentText]    = useState("");

  const debouncedSearch = useDebounce(searchInput, 400);

  const observer   = useRef();
  const pageRef    = useRef(1);
  const hasMoreRef = useRef(true);

  // ── Reset + fetch when filter or search changes ──────────────────────────
  const resetFeed = useCallback(() => {
    setPosts([]);
    pageRef.current    = 1;
    hasMoreRef.current = true;
    setHasMore(true);
  }, []);

  useEffect(() => {
    resetFeed();
  }, [filter, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Core fetch ───────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    if (!hasMoreRef.current || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:   pageRef.current,
        limit:  5,
        filter,
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      const res = await API.get(`/posts/feed?${params}`);
      setPosts((prev) =>
        pageRef.current === 1 ? res.data.posts : [...prev, ...res.data.posts]
      );
      hasMoreRef.current = res.data.hasMore;
      setHasMore(res.data.hasMore);
      pageRef.current += 1;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loading, filter, debouncedSearch]);

  // Trigger fetch after reset
  useEffect(() => {
    fetchPosts();
  }, [filter, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sidebar data — identical to original, but explore goes through cache
  useEffect(() => {
    if (!loggedUser) return;
    if (loggedUser.city) {
      getExploreData(loggedUser.city)
        .then((data) => setExploreData(data))
        .catch(() => {});
    }
    API.get(`/users/${loggedUser._id}`)
      .then((r) => setProfileData(r.data))
      .catch(() => {});
  }, [loggedUser]);

  // ── Infinite scroll sentinel ──────────────────────────────────────────────
  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current) fetchPosts();
      });
      if (node) observer.current.observe(node);
    },
    [loading, fetchPosts]
  );

  // ── Like ─────────────────────────────────────────────────────────────────
  const handleLike = async (postId) => {
    const post = posts.find((p) => p._id === postId);
    if (!post) return;
    const wasLiked  = post.likedByUser;
    const prevCount = post.likesCount ?? 0;
    setPosts((all) =>
      all.map((p) =>
        p._id === postId
          ? { ...p, likedByUser: !wasLiked, likesCount: wasLiked ? prevCount - 1 : prevCount + 1 }
          : p
      )
    );
    try {
      const res = await API.put(`/posts/like/${postId}`);
      setPosts((all) =>
        all.map((p) => p._id === postId ? { ...p, likesCount: res.data.likesCount } : p)
      );
    } catch {
      setPosts((all) =>
        all.map((p) =>
          p._id === postId ? { ...p, likedByUser: wasLiked, likesCount: prevCount } : p
        )
      );
    }
  };

  // ── Double-tap like ──────────────────────────────────────────────────────
  const handleDoubleTap = (postId) => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      handleLike(postId);
      setBurstPostId(postId);
      setTimeout(() => setBurstPostId(null), 800);
    }
    setLastTap(now);
  };

  // ── Comment ──────────────────────────────────────────────────────────────
  const handleAddComment = async () => {
    if (!commentText.trim() || !writeModalPost) return;
    try {
      const res = await API.post(`/posts/comment/${writeModalPost._id}`, {
        text: commentText.trim(),
      });
      setPosts((prev) =>
        prev.map((p) => p._id === writeModalPost._id ? { ...p, comments: res.data } : p)
      );
      setCommentText("");
      setWriteModalPost(null);
    } catch (err) { console.error(err); }
  };

  // ── Shared style tokens ───────────────────────────────────────────────────
  const card = {
    backgroundColor: isDark ? "rgba(30, 41, 59, 0.8)" : "rgba(255, 255, 255, 0.7)",
    borderColor:     isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  };

  return (
    <div
      className="min-h-screen transition-colors duration-500 relative"
      style={{ backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
    >
      <FloatingNav />

      {/* ── Background accents ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[120px]"
          style={{ backgroundColor: isDark ? "rgba(147,51,234,0.1)" : "rgba(147,51,234,0.05)" }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[120px]"
          style={{ backgroundColor: isDark ? "rgba(52,211,153,0.1)" : "rgba(52,211,153,0.05)" }}
        />
      </div>

      <div className="relative z-10 max-w-[1300px] mx-auto px-4 sm:px-6 pt-24 pb-16 flex gap-10 justify-center">

        {/* ══ LEFT SIDEBAR ══════════════════════════════════════════════════ */}
        <aside className="hidden lg:flex flex-col gap-6 w-[280px] xl:w-[300px] flex-shrink-0 sticky top-28 h-fit">

          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-2xl border p-7 rounded-[2.5rem] shadow-sm transition-colors duration-500"
            style={card}
          >
            <div className="flex items-center gap-4 mb-7">
              <img
                src={profileData?.avatar || loggedUser?.avatar || "/avatar.png"}
                onError={(e) => { e.target.src = "/avatar.png"; }}
                className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-lg flex-shrink-0"
                alt={loggedUser?.name}
              />
              <div className="min-w-0">
                <h3 className={`font-bold leading-tight truncate ${isDark ? "text-white" : "text-slate-800"}`}>
                  {loggedUser?.name}
                </h3>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                  @{loggedUser?.username}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t pt-6 text-center"
              style={{ borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}>
              {[
                { val: profileData?.postsCount ?? posts.filter(p => p.user?._id === loggedUser?._id).length ?? 0, label: "Posts" },
                { val: profileData?.followers?.length ?? 0,  label: "Followers" },
                { val: profileData?.following?.length ?? 0,  label: "Following" },
              ].map(({ val, label }) => (
                <div key={label}>
                  <p className={`text-base font-black ${isDark ? "text-white" : "text-slate-800"}`}>{val}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Trending news */}
          {exploreData?.news?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="backdrop-blur-2xl border p-7 rounded-[2.5rem] shadow-sm transition-colors duration-500"
              style={card}
            >
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-purple-500" />
                Trending in {loggedUser?.city}
              </h4>
              <div className="space-y-5">
                {exploreData.news.slice(0, 4).map((item, i) => (
                  <a key={i} href={item.url} target="_blank" rel="noreferrer" className="block group">
                    <p className={`text-[13px] font-bold group-hover:text-purple-500 transition-colors line-clamp-2 leading-snug ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                      {item.title}
                    </p>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{item.source}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </aside>

        {/* ══ CENTER FEED ═══════════════════════════════════════════════════ */}
        <main className="flex-1 min-w-0 max-w-[600px] space-y-6">

          {/* ── Search bar ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl border rounded-[2rem] overflow-hidden shadow-sm transition-colors duration-500"
            style={card}
          >
            <div className="flex items-center gap-3 px-5 py-3.5">
              <img
                src={profileData?.avatar || loggedUser?.avatar || "/avatar.png"}
                onError={(e) => { e.target.src = "/avatar.png"; }}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0 ring-2"
                style={{ ringColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}
                alt=""
              />

              <div className="flex-1 relative">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search posts by caption…"
                  className={`w-full pl-9 pr-8 py-2.5 rounded-2xl text-sm font-medium outline-none transition-all
                    ${isDark
                      ? "bg-slate-800/60 text-white placeholder:text-slate-500 focus:bg-slate-800"
                      : "bg-slate-100/70 text-slate-800 placeholder:text-slate-400 focus:bg-slate-100"
                    }`}
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                onClick={() => navigate("/profile/me")}
                className={`flex-shrink-0 p-2.5 rounded-2xl shadow-lg hover:scale-105 transition-all ${
                  isDark ? "bg-white text-slate-900" : "bg-slate-900 text-white"
                }`}
                title="New post"
              >
                <Plus size={18} strokeWidth={3} />
              </button>
            </div>

            {/* ── Filter pills ── */}
            <div className="flex gap-2 px-5 pb-4">
              {FILTERS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    filter === id
                      ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_12px_rgba(147,51,234,0.35)]"
                      : isDark
                        ? "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"
                        : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}

              <AnimatePresence>
                {debouncedSearch && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="ml-auto flex items-center gap-1 text-[10px] font-bold text-purple-400 uppercase tracking-wider"
                  >
                    Results for "{debouncedSearch}"
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Posts ── */}
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => (
                <motion.div
                  ref={posts.length === index + 1 ? lastPostRef : null}
                  key={post._id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="backdrop-blur-3xl border rounded-[2.5rem] shadow-xl overflow-hidden transition-colors duration-500"
                  style={{
                    backgroundColor: isDark ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.97)",
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Post header */}
                  <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Link to={`/profile/${post.user._id}`} className="flex-shrink-0">
                        <img
                          src={post.user?.avatar || "/avatar.png"}
                          onError={(e) => { e.target.src = "/avatar.png"; }}
                          className="w-12 h-12 rounded-2xl object-cover ring-2"
                          style={{ ringColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" }}
                          alt={post.user?.name}
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          to={`/profile/${post.user._id}`}
                          className={`font-bold block hover:underline leading-none text-base tracking-tight truncate ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {post.user?.name}
                        </Link>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1 inline-block">
                          {post.user?.city}
                        </span>
                      </div>
                    </div>

                    {post.user._id !== loggedUser?._id && (
                      <Link
                        to={`/chat/${post.user._id}`}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                          isDark
                            ? "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <MessageCircle size={13} />
                        Message
                      </Link>
                    )}
                  </div>

                  {/* Post image */}
                  {post.image && (
                    <div
                      className="px-6 cursor-pointer relative select-none"
                      onClick={() => handleDoubleTap(post._id)}
                    >
                      <div className="rounded-[2rem] overflow-hidden"
                        style={{ backgroundColor: isDark ? "#1e293b" : "#f1f5f9" }}>
                        <img
                          src={post.image}
                          alt="post"
                          loading="lazy"
                          className="w-full aspect-[4/5] object-cover transition-transform duration-700 hover:scale-105"
                        />
                      </div>
                      <AnimatePresence>
                        {burstPostId === post._id && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1.3, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                          >
                            <Heart size={90} fill="#EF4444" className="text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Post footer */}
                  <div className="px-7 py-6">
                    <div className="flex items-center gap-6 mb-4">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-2 transition-all active:scale-90 ${
                          post.likedByUser
                            ? "text-red-500 scale-110"
                            : `${isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-900"}`
                        }`}
                      >
                        <Heart size={23} fill={post.likedByUser ? "currentColor" : "none"} />
                        <span className="text-sm font-black">{post.likesCount || 0}</span>
                      </button>

                      <button
                        onClick={() => setWriteModalPost(post)}
                        className={`flex items-center gap-2 transition-all ${
                          isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-900"
                        }`}
                      >
                        <MessageCircle size={23} />
                        <span className="text-sm font-black">{post.comments?.length || 0}</span>
                      </button>

                      <Send
                        size={23}
                        className={`transition-all hover:rotate-12 cursor-pointer ${
                          isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-900"
                        }`}
                      />
                      <div className="flex-1" />
                      <Bookmark
                        size={23}
                        className={`cursor-pointer transition-all ${
                          isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-900"
                        }`}
                      />
                    </div>

                    {post.caption && (
                      <p className={`text-[15px] leading-relaxed font-medium ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}>
                        <span className={`font-black mr-2 text-[11px] uppercase tracking-widest ${
                          isDark ? "text-white" : "text-slate-950"
                        }`}>
                          @{post.user?.username}
                        </span>
                        {debouncedSearch
                          ? post.caption.split(new RegExp(`(${debouncedSearch})`, "gi")).map((part, i) =>
                              part.toLowerCase() === debouncedSearch.toLowerCase()
                                ? <mark key={i} className="bg-purple-500/30 text-purple-300 rounded px-0.5">{part}</mark>
                                : part
                            )
                          : post.caption
                        }
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                {debouncedSearch
                  ? <Search size={32} className="text-slate-500" />
                  : <LayoutGrid size={32} className="text-slate-500" />
                }
              </div>
              <p className={`text-sm font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {debouncedSearch
                  ? `No posts matching "${debouncedSearch}"`
                  : filter === "following"
                    ? "No posts from people you follow yet"
                    : filter === "nearby"
                      ? "No posts from your area yet"
                      : "No posts yet — be the first!"
                }
              </p>
            </motion.div>
          )}
        </main>

        {/* ══ RIGHT SIDEBAR ═════════════════════════════════════════════════ */}
        <aside className="hidden xl:flex flex-col gap-6 w-[280px] xl:w-[300px] flex-shrink-0 sticky top-28 h-fit">

          {/* Weather */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="p-7 rounded-[2.5rem] shadow-sm border transition-colors duration-500"
            style={{
              backgroundColor: isDark ? "rgba(30,41,59,0.8)" : "#FDF8F1",
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(251,191,36,0.2)",
            }}
          >
            <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-5 ${isDark ? "text-orange-400" : "text-orange-600/60"}`}>
              Today in {loggedUser?.city}
            </h4>

            {exploreData?.weather ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-5">
                  <div className={`p-3 rounded-[1.2rem] shadow-sm ring-1 flex-shrink-0 ${isDark ? "bg-slate-800 ring-slate-700" : "bg-white ring-orange-100"}`}>
                    <img
                      src={`https://openweathermap.org/img/wn/${exploreData.weather.icon}@2x.png`}
                      className="w-12 h-12"
                      alt="weather"
                    />
                  </div>
                  <div>
                    <p className={`text-4xl font-black tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
                      {exploreData.weather.temp}°
                    </p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest capitalize">
                      {exploreData.weather.description}
                    </p>
                  </div>
                </div>
                <div
                  className="mt-7 pt-6 flex justify-around"
                  style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(251,191,36,0.15)" }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Droplets size={16} className="text-blue-400" />
                    <span className={`text-[11px] font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                      {exploreData.weather.humidity}%
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Humidity</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Wind size={16} className="text-slate-400" />
                    <span className={`text-[11px] font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                      {exploreData.weather.windSpeed}m/s
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Wind</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-pulse flex gap-4">
                <div className={`w-14 h-14 rounded-2xl flex-shrink-0 ${isDark ? "bg-slate-800" : "bg-orange-100"}`} />
                <div className="space-y-2 flex-1">
                  <div className={`h-8 w-20 rounded-lg ${isDark ? "bg-slate-800" : "bg-orange-100"}`} />
                  <div className={`h-3 w-24 rounded ${isDark ? "bg-slate-800" : "bg-orange-100"}`} />
                </div>
              </div>
            )}
          </motion.div>

          {/* Community room */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-7 rounded-[2.5rem] shadow-sm border transition-colors duration-500"
            style={{
              backgroundColor: isDark ? "rgba(30,41,59,0.8)" : "#EBF7F4",
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(16,185,129,0.2)",
            }}
          >
            <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600/60"}`}>
              Community Room
            </h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Join the live conversation with other locals in {loggedUser?.city}.
            </p>
            <button
              onClick={() => navigate("/communities")}
              className="w-full mt-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all"
            >
              Enter Room
            </button>
          </motion.div>
        </aside>
      </div>

      {/* ── Comment modal ── */}
      <AnimatePresence>
        {writeModalPost && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-md p-4"
            onClick={() => setWriteModalPost(null)}
          >
            <motion.div
              initial={{ y: 60, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 60, scale: 0.97 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`w-full max-w-md rounded-[3rem] p-8 shadow-2xl ${isDark ? "bg-slate-900" : "bg-white"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <p className={`text-xs font-black uppercase tracking-widest mb-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Reply to @{writeModalPost.user?.username}
              </p>
              <textarea
                autoFocus
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddComment(); }}
                placeholder="Say something nice…"
                rows={4}
                className={`w-full rounded-[1.8rem] p-5 outline-none resize-none border focus:ring-2 ring-purple-500/20 transition-all text-sm ${
                  isDark
                    ? "bg-slate-800 text-white border-slate-700 placeholder:text-slate-600"
                    : "bg-slate-50 text-slate-800 border-slate-100 placeholder:text-slate-400"
                }`}
              />
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setWriteModalPost(null)}
                  className={`flex-1 py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest border transition-all ${
                    isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className={`flex-1 py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-40 ${
                    isDark ? "bg-white text-slate-900" : "bg-slate-900 text-white"
                  }`}
                >
                  Post Comment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Feed;