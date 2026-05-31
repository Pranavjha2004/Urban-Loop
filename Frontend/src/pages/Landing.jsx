import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Compass,
  FileText,
  MapPin,
  MessageCircle,
  Moon,
  Radio,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const features = [
  { icon: MessageCircle, title: "Live chats", text: "DMs, groups, voice notes, files, polls, and real-time presence." },
  { icon: Video, title: "Calls", text: "Voice and video rooms with polished controls and instant invitations." },
  { icon: Users, title: "Communities", text: "City-based rooms for events, local updates, and focused groups." },
  { icon: Compass, title: "Explore", text: "Discover must-visit places, heritage spots, weather, and events." },
];

const stats = [
  ["Realtime", "Socket-powered chat"],
  ["Local-first", "City discovery"],
  ["Social", "Posts and profiles"],
];

const services = [
  {
    icon: MessageCircle,
    title: "Messaging suite",
    text: "Start private chats, create groups, send files, react to messages, forward posts, share voice notes, and keep conversations moving in real time.",
  },
  {
    icon: Video,
    title: "Voice and video calling",
    text: "Jump from chat into a voice or video room with incoming call alerts, call history, screen sharing, camera switching, and group-ready controls.",
  },
  {
    icon: Users,
    title: "Community rooms",
    text: "Build city communities with public or private access, broadcast-only channels, polls, images, member views, and live group discussion.",
  },
  {
    icon: Compass,
    title: "Explore your city",
    text: "See weather, city news, must-visit heritage places, directions, and ongoing or upcoming events without leaving your social flow.",
  },
  {
    icon: FileText,
    title: "Posts and profiles",
    text: "Publish visual stories, tune profile identity, follow locals, browse feeds, and keep your city-facing presence fresh.",
  },
  {
    icon: ShieldCheck,
    title: "Secure sessions",
    text: "HTTP-only auth cookies, protected routes, upload limits, and production-ready environment configuration for real deployments.",
  },
];

const journey = [
  ["Discover", "Find city news, nearby heritage spots, events, and community activity."],
  ["Connect", "Follow people, message friends, join rooms, and build focused groups."],
  ["Coordinate", "Call, share media, vote in polls, and plan what happens next."],
];

function Landing() {
  const navigate = useNavigate();
  const { user, loading, theme, toggleTheme } = useAuth();
  const isDark = theme === "dark";
  const { scrollYProgress } = useScroll();
  const cityY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const orbRotate = useTransform(scrollYProgress, [0, 1], [0, 28]);

  useEffect(() => {
    if (!loading && user) navigate("/feed", { replace: true });
  }, [loading, user, navigate]);

  return (
    <main
      className={`min-h-screen overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-[#05070a] text-white" : "bg-[#f7fbff] text-slate-950"
      }`}
    >
      <div className="fixed inset-0 pointer-events-none">
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)]"
              : "bg-[linear-gradient(rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.055)_1px,transparent_1px)]"
          } bg-[size:56px_56px]`}
        />
        <motion.div
          style={{ y: cityY }}
          className={`absolute inset-x-0 bottom-0 h-[42vh] ${
            isDark ? "opacity-70" : "opacity-55"
          }`}
        >
          <div className="absolute bottom-0 left-[-5%] h-[62%] w-[22%] bg-teal-500/20 backdrop-blur-sm [clip-path:polygon(0_35%,100%_10%,100%_100%,0_100%)]" />
          <div className="absolute bottom-0 left-[12%] h-[78%] w-[18%] bg-slate-500/20 backdrop-blur-sm [clip-path:polygon(0_18%,100%_0,100%_100%,0_100%)]" />
          <div className="absolute bottom-0 left-[28%] h-[52%] w-[25%] bg-sky-500/20 backdrop-blur-sm [clip-path:polygon(0_20%,100%_35%,100%_100%,0_100%)]" />
          <div className="absolute bottom-0 left-[50%] h-[72%] w-[20%] bg-emerald-500/15 backdrop-blur-sm [clip-path:polygon(0_0,100%_24%,100%_100%,0_100%)]" />
          <div className="absolute bottom-0 right-[-6%] h-[58%] w-[38%] bg-blue-500/15 backdrop-blur-sm [clip-path:polygon(0_30%,100%_5%,100%_100%,0_100%)]" />
        </motion.div>
      </div>

      <header className="fixed left-0 right-0 top-0 z-50 px-4 py-5 sm:px-8">
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-full border px-3 py-2 shadow-2xl backdrop-blur-2xl ${
            isDark ? "border-white/10 bg-black/35 shadow-black/30" : "border-white/80 bg-white/75 shadow-slate-200/80"
          }`}
        >
          <div className="flex items-center gap-2 px-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isDark ? "bg-white text-black" : "bg-slate-950 text-white"}`}>
              <div className={`h-3 w-3 rounded-full ${isDark ? "bg-black" : "bg-white"}`} />
            </div>
            <span className="text-sm font-black uppercase tracking-tight">Urban Loop</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`rounded-full border p-2.5 transition-all hover:scale-105 ${
                isDark ? "border-white/10 bg-white/5 text-amber-200" : "border-slate-200 bg-white text-slate-700"
              }`}
              title="Toggle theme"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link
              to="/login"
              className={`hidden rounded-full px-5 py-2.5 text-sm font-bold transition-all sm:inline-flex ${
                isDark ? "text-zinc-300 hover:bg-white/10 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-400 to-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-105"
            >
              Register <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-20 pt-32 sm:px-8 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.22em] ${
              isDark ? "border-teal-300/20 bg-teal-300/10 text-teal-200" : "border-teal-500/20 bg-teal-500/10 text-teal-700"
            }`}>
              <Sparkles size={14} /> City social, redesigned
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.08] tracking-tight sm:text-7xl sm:leading-[1.05] lg:text-8xl lg:leading-[1.08]">
              Your city, moving in one loop.
            </h1>
            <p className={`mt-7 max-w-2xl text-base leading-8 sm:text-lg ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
              Urban Loop brings local feeds, chats, calls, communities, events, and places into one fast social space built around where you live.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 to-blue-600 px-7 py-4 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-500/20 transition-all hover:-translate-y-1"
              >
                Join Urban Loop <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className={`inline-flex items-center justify-center rounded-2xl border px-7 py-4 text-sm font-black uppercase tracking-widest transition-all hover:-translate-y-1 ${
                  isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                }`}
              >
                Login
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 12 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto h-[520px] w-full max-w-[520px] [perspective:1200px]"
          >
            <motion.div
              style={{ rotate: orbRotate }}
              className="absolute inset-8 rounded-full bg-gradient-to-br from-teal-300/30 via-sky-500/20 to-blue-700/30 blur-3xl"
            />
            <motion.div
              animate={{ rotateY: [0, 9, -7, 0], rotateX: [0, -5, 4, 0], y: [0, -12, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute left-1/2 top-1/2 h-[360px] w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-[2.2rem] border p-4 shadow-2xl [transform-style:preserve-3d] ${
                isDark ? "border-white/10 bg-slate-950/70 shadow-black/50" : "border-white bg-white/85 shadow-slate-300/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-400">Live city</p>
                  <h3 className="mt-1 text-lg font-black">Bhubaneswar</h3>
                </div>
                <Radio className="text-teal-400" size={22} />
              </div>
              <div className={`mt-5 rounded-[1.5rem] border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-blue-600 text-white">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-black">Heritage walk</p>
                    <p className={`text-xs ${isDark ? "text-zinc-500" : "text-slate-500"}`}>Old Town, 6:30 PM</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  [Users, "Rooms"],
                  [Bell, "Alerts"],
                  [Zap, "Nearby"],
                  [ShieldCheck, "Private"],
                ].map(([Icon, label]) => (
                  <div key={label} className={`rounded-2xl border p-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-white"}`}>
                    <Icon size={18} className="text-blue-500" />
                    <p className="mt-3 text-xs font-black">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -18, 0], rotate: [0, 4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute left-2 top-24 rounded-3xl border p-4 shadow-2xl ${
                isDark ? "border-white/10 bg-black/50" : "border-white bg-white/90"
              }`}
            >
              <MessageCircle className="text-teal-400" />
              <p className="mt-2 text-xs font-black">24 live chats</p>
            </motion.div>
            <motion.div
              animate={{ y: [0, 18, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute bottom-24 right-2 rounded-3xl border p-4 shadow-2xl ${
                isDark ? "border-white/10 bg-black/50" : "border-white bg-white/90"
              }`}
            >
              <Video className="text-blue-500" />
              <p className="mt-2 text-xs font-black">Instant calls</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map(([label, text], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.08 }}
              className={`rounded-3xl border p-6 backdrop-blur-xl ${
                isDark ? "border-white/10 bg-white/5" : "border-white bg-white/75"
              }`}
            >
              <p className="text-3xl font-black">{label}</p>
              <p className={`mt-2 text-sm ${isDark ? "text-zinc-400" : "text-slate-600"}`}>{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-500">Everything connected</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Built for daily local motion.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 36, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.06, duration: 0.45 }}
              className={`group rounded-3xl border p-6 backdrop-blur-xl transition-all hover:-translate-y-2 ${
                isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-white bg-white/75 hover:bg-white"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-blue-600 text-white shadow-lg shadow-blue-500/20 transition-transform group-hover:rotate-6 group-hover:scale-110">
                <Icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-black">{title}</h3>
              <p className={`mt-3 text-sm leading-6 ${isDark ? "text-zinc-400" : "text-slate-600"}`}>{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10">
        <div className="grid items-end gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            className={`rounded-[2rem] border p-7 backdrop-blur-xl ${
              isDark ? "border-white/10 bg-white/5" : "border-white bg-white/75"
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-500">Services</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">More than a feed.</h2>
            <p className={`mt-5 text-sm leading-7 ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
              Urban Loop is designed as a compact city operating layer: communication, discovery, local identity, groups, calls, and useful context work together instead of living in separate tabs.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["Realtime", "Profiles", "Events", "Places", "Calls", "Groups"].map((item) => (
                <span
                  key={item}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                    isDark ? "border-white/10 bg-white/5 text-zinc-300" : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2">
            {services.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.04 }}
                className={`rounded-3xl border p-5 backdrop-blur-xl transition-all hover:-translate-y-1 ${
                  isDark ? "border-white/10 bg-black/25 hover:bg-white/10" : "border-white bg-white/80 hover:bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-blue-600 text-white">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-black">{title}</h3>
                    <p className={`mt-2 text-sm leading-6 ${isDark ? "text-zinc-400" : "text-slate-600"}`}>{text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10">
        <div className={`relative overflow-hidden rounded-[2.5rem] border p-6 backdrop-blur-xl sm:p-8 lg:p-10 ${
          isDark ? "border-white/10 bg-white/5" : "border-white bg-white/75"
        }`}>
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-500">How it feels</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">From city signal to real plans.</h2>
              <p className={`mt-5 text-sm leading-7 ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
                The app is shaped around the way local life actually moves: notice something, talk about it, gather people, and make it happen.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {journey.map(([title, text], index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 26, rotateX: 10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-3xl border p-5 ${
                    isDark ? "border-white/10 bg-slate-950/45" : "border-slate-100 bg-white/90"
                  }`}
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-blue-600 text-lg font-black text-white">
                    {index + 1}
                  </div>
                  <h3 className="font-black">{title}</h3>
                  <p className={`mt-3 text-sm leading-6 ${isDark ? "text-zinc-400" : "text-slate-600"}`}>{text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            className={`rounded-[2rem] border p-7 backdrop-blur-xl ${
              isDark ? "border-white/10 bg-black/30" : "border-white bg-white/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="text-teal-500" size={24} />
              <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-500">Local intelligence</p>
            </div>
            <h2 className="mt-5 text-4xl font-black tracking-tight">Designed to keep useful things close.</h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                ["Weather and news", "Context before you step out."],
                ["Events and heritage", "Know what is worth visiting."],
                ["Polls and broadcasts", "Let groups decide quickly."],
                ["Call history", "Return to important conversations."],
              ].map(([title, text]) => (
                <div key={title} className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50"}`}>
                  <p className="font-black">{title}</p>
                  <p className={`mt-1 text-sm ${isDark ? "text-zinc-400" : "text-slate-600"}`}>{text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: 0.08 }}
            className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-400 via-blue-500 to-slate-950 p-7 text-white shadow-2xl shadow-blue-500/20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              className="absolute right-[-110px] top-[-110px] h-72 w-72 rounded-full border border-white/20"
            />
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-[1.7rem] border border-white/20 bg-white/15 p-5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-white/70">Tonight</p>
                  <h3 className="mt-1 text-2xl font-black">Community room</h3>
                </div>
                <CalendarDays />
              </div>
              <p className="mt-12 max-w-xs text-sm leading-6 text-white/80">
                Create a local room, invite members, share a poll, then jump into a call when plans need voice.
              </p>
            </motion.div>
            <div className="absolute bottom-7 left-7 right-7 grid grid-cols-3 gap-3">
              {["Chat", "Poll", "Call"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/15 bg-black/20 p-4 text-center text-xs font-black uppercase tracking-widest backdrop-blur-xl">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 px-5 pb-8 sm:px-8 lg:px-10">
        <div className={`mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border backdrop-blur-2xl ${
          isDark ? "border-white/10 bg-slate-950/70" : "border-white bg-white/85"
        }`}>
          <div className="relative p-7 sm:p-10">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-r from-teal-400/20 via-blue-500/20 to-transparent" />
            <div className="relative grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full ${isDark ? "bg-white text-black" : "bg-slate-950 text-white"}`}>
                    <div className={`h-4 w-4 rounded-full ${isDark ? "bg-black" : "bg-white"}`} />
                  </div>
                  <div>
                    <p className="text-lg font-black uppercase tracking-tight">Urban Loop</p>
                    <p className={`text-sm ${isDark ? "text-zinc-500" : "text-slate-500"}`}>One city. One loop.</p>
                  </div>
                </div>
                <p className={`mt-6 max-w-xl text-sm leading-7 ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
                  A social layer for local discovery, community building, messaging, calling, profiles, and everyday city coordination.
                </p>
              </div>
              <div className="flex flex-col justify-between gap-6 sm:items-end">
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {["Feed", "Explore", "Chat", "Communities", "Calls"].map((item) => (
                    <span key={item} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                      isDark ? "border-white/10 bg-white/5 text-zinc-300" : "border-slate-200 bg-white text-slate-600"
                    }`}>
                      {item}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Link to="/login" className={`rounded-2xl border px-5 py-3 text-xs font-black uppercase tracking-widest ${
                    isDark ? "border-white/10 text-white hover:bg-white/10" : "border-slate-200 text-slate-900 hover:bg-slate-50"
                  }`}>
                    Login
                  </Link>
                  <Link to="/register" className="rounded-2xl bg-gradient-to-r from-teal-400 to-blue-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">
                    Register
                  </Link>
                </div>
              </div>
            </div>
            <div className={`relative mt-10 flex flex-col gap-3 border-t pt-5 text-xs sm:flex-row sm:items-center sm:justify-between ${
              isDark ? "border-white/10 text-zinc-500" : "border-slate-200 text-slate-500"
            }`}>
              <span>
                Developed with love 💓{" "}
                <a
                  href="https://www.linkedin.com/in/pranav-kumar-jha-2669722b5/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-teal-400 transition-colors hover:text-sky-400"
                >
                  Pranav Jha
                </a>
                {" "}and Dolamani Meher
              </span>
              <span>Urban Loop © {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Landing;
