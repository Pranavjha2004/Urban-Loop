import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import ChatPage from "./pages/ChatPage";
import CommunitiesPage from "./pages/CommunitiesPage";
import CommunityRoom from "./pages/CommunityRoom";
import Explore from "./pages/Explore";
import AdminPanel from "./pages/AdminPanel";

import IncomingCallNotification from "./components/IncomingCallNotification";
import CallRoom from "./components/CallRoom";

import "./App.css";

const routeMeta = [
  {
    match: (path) => path === "/",
    title: "Urban Loop - One City. One Loop.",
    description: "Urban Loop connects your city through local discovery, communities, chat, calls, posts, places, and events.",
  },
  {
    match: (path) => path === "/login",
    title: "Login | Urban Loop",
    description: "Sign in to Urban Loop to continue discovering your city, communities, chats, calls, and local updates.",
  },
  {
    match: (path) => path === "/register",
    title: "Register | Urban Loop",
    description: "Create an Urban Loop account and join your local city community.",
  },
  {
    match: (path) => path === "/feed",
    title: "Feed | Urban Loop",
    description: "View posts, updates, and activity from your local Urban Loop network.",
  },
  {
    match: (path) => path.startsWith("/profile"),
    title: "Profile | Urban Loop",
    description: "View profiles, posts, followers, settings, and local identity on Urban Loop.",
  },
  {
    match: (path) => path.startsWith("/chat"),
    title: "Chat | Urban Loop",
    description: "Chat in real time, send media, create groups, share polls, and start calls on Urban Loop.",
  },
  {
    match: (path) => path === "/communities",
    title: "Communities | Urban Loop",
    description: "Explore, create, join, and manage city communities on Urban Loop.",
  },
  {
    match: (path) => path.startsWith("/communities/"),
    title: "Community Room | Urban Loop",
    description: "Connect inside an Urban Loop community room with messages, members, media, and polls.",
  },
  {
    match: (path) => path.startsWith("/explore/"),
    title: "Explore City | Urban Loop",
    description: "Explore weather, news, must-visit places, heritage spots, and upcoming events in your city.",
  },
  {
    match: (path) => path === "/admin",
    title: "Admin Panel | Urban Loop",
    description: "Urban Loop admin dashboard for platform analytics, moderation, users, posts, calls, and activity insights.",
  },
];

function RouteMetadata() {
  const location = useLocation();

  useEffect(() => {
    const meta = routeMeta.find((item) => item.match(location.pathname)) || {
      title: "Urban Loop",
      description: "Urban Loop is a city-first social platform for local discovery, communities, chat, calls, posts, places, and events.",
    };

    document.title = meta.title;

    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) descriptionTag.setAttribute("content", meta.description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", meta.title);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", meta.description);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", meta.title);

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute("content", meta.description);
  }, [location.pathname]);

  return null;
}

function AppInner() {
  const [activeCall, setActiveCall] = useState(null);
  const { user, theme, loading } = useAuth(); // Access both theme and loading state
  const isDark = theme === "dark";

  const handleAcceptCall = (callData) => {
    setActiveCall({
      roomId: callData.roomId,
      type: callData.type,
      callType: callData.callType,
      chatId: callData.chatId,
      participants: callData.participants || [],
      isInitiator: false,
    });
  };

  // ─── PREMIUM AUTH LOADER ───
  if (loading) {
    return (
      <div 
        className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500"
        style={{ backgroundColor: isDark ? "#080a0c" : "#fbfcf8" }}
      >
        <div className="relative flex items-center justify-center">
          {/* Pulsing Outer Glow */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-24 h-24 rounded-full blur-2xl"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}
          />

          {/* Spinning Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-2 border-transparent border-t-purple-500 border-r-purple-500"
          />

          {/* Static Center Brand Dot */}
          <div className="absolute flex items-center justify-center">
             <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-white' : 'bg-black'}`}>
                <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-black' : 'bg-white'}`} />
             </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Syncing Loop
          </span>
          <div className="flex gap-1">
             {[0, 1, 2].map((i) => (
               <motion.div
                 key={i}
                 animate={{ opacity: [0, 1, 0] }}
                 transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                 className={`w-1 h-1 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}
               />
             ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen transition-colors duration-500"
      style={{ backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
    >
      <RouteMetadata />
      <IncomingCallNotification
        onAccept={handleAcceptCall}
        onReject={() => {}}
      />

      <AnimatePresence>
        {activeCall && (
          <CallRoom
            roomId={activeCall.roomId}
            type={activeCall.type}
            callType={activeCall.callType}
            chatId={activeCall.chatId}
            participants={activeCall.participants}
            userId={user?._id}
            isInitiator={activeCall.isInitiator}
            onEnd={() => setActiveCall(null)}
          />
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:userId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/communities"
          element={
            <ProtectedRoute>
              <CommunitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/communities/:id"
          element={
            <ProtectedRoute>
              <CommunityRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/explore/:city"
          element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <BrowserRouter>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
