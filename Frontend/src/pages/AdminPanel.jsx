import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Clock3, MessageCircle, Phone, RefreshCw, Shield, Trash2, Undo2, UserX, Users, FileText } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const fmtDuration = (seconds = 0) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
};

const Stat = ({ icon: Icon, label, value, accent }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl backdrop-blur-2xl dark:bg-slate-950/60">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">{label}</p>
        <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
      </div>
      <div className={`rounded-2xl p-3 ${accent}`}>
        <Icon size={22} />
      </div>
    </div>
  </motion.div>
);

const Bars = ({ title, data, color = "from-teal-400 to-blue-500" }) => {
  const max = Math.max(...data.map((x) => x.count || 0), 1);
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-2xl dark:bg-slate-950/60">
      <p className="text-sm font-black text-slate-950 dark:text-white">{title}</p>
      <div className="mt-5 flex h-44 items-end gap-2">
        {data.map((item) => (
          <div key={item._id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className={`w-full rounded-t-xl bg-gradient-to-t ${color}`} style={{ height: `${Math.max(8, ((item.count || 0) / max) * 150)}px` }} />
            <span className="max-w-full truncate text-[10px] text-slate-500 dark:text-zinc-500">{item._id?.slice(5) || "-"}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

function AdminPanel() {
  const { user, theme, toggleTheme } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const isDark = theme === "dark";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, postsRes] = await Promise.all([
        API.get("/admin/analytics"),
        API.get(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`),
        API.get(`/admin/posts${search ? `?search=${encodeURIComponent(search)}` : ""}`),
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setPosts(postsRes.data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [user?.role, load]);

  const action = async (fn) => {
    await fn();
    await load();
  };

  const callChart = useMemo(() => analytics?.callsByType?.map((x) => ({ _id: x._id, count: x.count })) || [], [analytics]);

  if (user?.role !== "admin") return <Navigate to="/feed" replace />;

  return (
    <main className="urban-shell min-h-[100dvh] px-4 py-5 text-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.08] p-5 backdrop-blur-2xl dark:bg-slate-950/70 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-teal-400 to-blue-600 p-3 text-white"><Shield size={24} /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-teal-500">Urban Loop Admin</p>
                <h1 className="text-3xl font-black tracking-tight">Platform Command Center</h1>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-zinc-400">Live analytics, user moderation, post operations, call history insights, and platform health in one responsive dashboard.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={toggleTheme} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold">{isDark ? "Light" : "Dark"}</button>
            <button onClick={load} className="urban-pill flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold"><RefreshCw size={16} /> Refresh</button>
          </div>
        </header>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {["overview", "users", "posts"].map((item) => (
              <button key={item} onClick={() => setTab(item)} className={`rounded-2xl px-4 py-2 text-sm font-black capitalize ${tab === item ? "urban-pill" : "border border-white/10 bg-white/[0.06] text-slate-700 dark:text-zinc-300"}`}>{item}</button>
            ))}
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users, cities, posts..." className="urban-input rounded-2xl px-4 py-3 text-sm" />
        </div>

        {loading && <p className="mt-8 text-sm text-slate-500 dark:text-zinc-500">Refreshing live platform data...</p>}

        {tab === "overview" && analytics && (
          <section className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={Users} label="Users" value={analytics.summary.totalUsers} accent="bg-teal-400/15 text-teal-500" />
              <Stat icon={FileText} label="Posts" value={analytics.summary.totalPosts} accent="bg-blue-400/15 text-blue-500" />
              <Stat icon={MessageCircle} label="Messages" value={analytics.summary.totalMessages} accent="bg-purple-400/15 text-purple-500" />
              <Stat icon={Phone} label="Call Time" value={fmtDuration(analytics.summary.totalCallDuration)} accent="bg-emerald-400/15 text-emerald-500" />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <Bars title="Posts Created" data={analytics.postsByDay} />
              <Bars title="Login Activity" data={analytics.loginsByDay} color="from-purple-400 to-pink-500" />
              <Bars title="Calls By Type" data={callChart} color="from-amber-400 to-red-500" />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 dark:bg-slate-950/60">
                <p className="mb-4 font-black">Top User Activity</p>
                {analytics.topUsers.map((u) => (
                  <div key={u._id} className="flex items-center justify-between border-t border-white/10 py-3 text-sm">
                    <span className="font-bold">{u.name} <span className="text-slate-500">@{u.username}</span></span>
                    <span>{u.postCount} posts · {u.callCount} calls · {u.loginCount || 0} logins</span>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 dark:bg-slate-950/60">
                <p className="mb-4 font-black">Recent Users</p>
                {analytics.recentUsers.map((u) => (
                  <div key={u._id} className="flex items-center justify-between border-t border-white/10 py-3 text-sm">
                    <span className="font-bold">{u.name}</span>
                    <span className="text-slate-500">{u.city} · {u.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === "users" && (
          <section className="mt-6 grid gap-3">
            {users.map((u) => (
              <div key={u._id} className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-4 dark:bg-slate-950/60 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
                <div><p className="font-black">{u.name} <span className="text-sm text-slate-500">@{u.username}</span></p><p className="text-sm text-slate-500">{u.email} · {u.city} · {u.role}</p></div>
                <div className="text-sm text-slate-600 dark:text-zinc-400">{u.postCount} posts · {u.callCount} calls · {fmtDuration(u.callDuration)} · {u.loginCount || 0} logins</div>
                <div className="flex gap-2">
                  {u.isSuspended ? <button onClick={() => action(() => API.patch(`/admin/users/${u._id}/restore`))} className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white"><Undo2 size={14} /></button> : <button onClick={() => action(() => API.patch(`/admin/users/${u._id}/suspend`))} className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white"><UserX size={14} /></button>}
                  <button onClick={() => window.confirm("Permanently delete this user?") && action(() => API.delete(`/admin/users/${u._id}`))} className="rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </section>
        )}

        {tab === "posts" && (
          <section className="mt-6 grid gap-3">
            {posts.map((p) => (
              <div key={p._id} className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-4 dark:bg-slate-950/60 lg:grid-cols-[80px_1fr_auto] lg:items-center">
                <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800">{p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}</div>
                <div><p className="font-black">{p.user?.name || "Unknown"} <span className="text-sm text-slate-500">@{p.user?.username}</span></p><p className="line-clamp-2 text-sm text-slate-600 dark:text-zinc-400">{p.caption || "No caption"}</p><p className="mt-1 text-xs text-slate-500">{p.deletedAt ? `Hidden: ${p.deleteReason || "No reason"}` : "Visible"} · {p.likes?.length || 0} likes · {p.comments?.length || 0} comments</p></div>
                <div className="flex gap-2">
                  {p.deletedAt ? <button onClick={() => action(() => API.patch(`/admin/posts/${p._id}/restore`))} className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white"><Undo2 size={14} /></button> : <button onClick={() => action(() => API.patch(`/admin/posts/${p._id}/hide`, { reason: "Hidden by admin" }))} className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white"><Clock3 size={14} /></button>}
                  <button onClick={() => window.confirm("Permanently delete this post?") && action(() => API.delete(`/admin/posts/${p._id}`))} className="rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default AdminPanel;
