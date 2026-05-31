import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
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

import IncomingCallNotification from "./components/IncomingCallNotification";
import CallRoom from "./components/CallRoom";

import "./App.css";

function AppInner() {
  const [activeCall, setActiveCall] = useState(null);
  const { theme, loading } = useAuth(); // Access both theme and loading state
  const isDark = theme === "dark";

  const handleAcceptCall = (callData) => {
    setActiveCall({
      roomId: callData.roomId,
      type: callData.type,
      callType: callData.callType,
      chatId: callData.chatId,
      participants: [],
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