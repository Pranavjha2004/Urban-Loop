import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Home, Compass, User, MessageCircle, Moon, Sun, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

function FloatingNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, theme, toggleTheme } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const isChatPage = location.pathname.startsWith("/chat");
  const [expanded, setExpanded] = useState(!isChatPage);
  const showItems = !isChatPage || expanded;

  const navItems = [
    { name: "Feed", icon: Home, path: "/feed" },
    { name: "Explore", icon: Compass, path: `/explore/${user?.city}` },
    { name: "Rooms", icon: Users, path: "/communities" },
    { name: "Chat", icon: MessageCircle, path: "/chat" },
    { name: "Me", icon: User, path: "/profile/me" },
  ];

  const fetchUnread = useCallback(async () => {
    try {
      const res = await API.get("/messages/unread/count");
      setUnreadCount(res.data.count || 0);
    } catch (err) { console.log(err); }
  }, []);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread, location.pathname]);

  useEffect(() => {
    if (!user) return;
    socket.emit("user-online", user._id);
    socket.on("new-message-notification", fetchUnread);
    socket.on("messages-read", fetchUnread);
    return () => {
      socket.off("new-message-notification", fetchUnread);
      socket.off("messages-read", fetchUnread);
    };
  }, [user, fetchUnread]);

  useEffect(() => {
    setExpanded(!location.pathname.startsWith("/chat"));
  }, [location.pathname]);

  const dockedOnChat = isChatPage && !expanded;

  return (
    <motion.div
      layout
      className={`floating-nav ${
        dockedOnChat ? "floating-nav--chat-docked" : "floating-nav--center"
      } ${showItems ? "floating-nav--open" : "floating-nav--closed"}`}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        layout
        className="floating-nav__rail flex items-center gap-1 p-1.5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-full shadow-[0_18px_60px_rgba(2,6,23,0.18)] transition-all duration-500 overflow-x-auto"
      >
        {/* Brand Logo */}

        <button
          onClick={() => {
            if (isChatPage && !expanded) setExpanded(true);
            else navigate(user ? "/feed" : "/");
          }}
          className={`floating-nav__brand px-3 py-1.5 flex items-center gap-2 hover:opacity-70 transition-all cursor-pointer pointer-events-auto ${
            showItems ? "border-r border-slate-200 dark:border-slate-700" : ""
          }`}
          title={isChatPage && !expanded ? "Open navigation" : "Urban Loop"}
        >
          <div className="w-5 h-5 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white dark:bg-slate-900 rounded-full" />
          </div>
          <AnimatePresence initial={false}>
            {showItems && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="floating-nav__brand-text overflow-hidden whitespace-nowrap text-xs font-bold text-slate-800 dark:text-white uppercase tracking-tighter"
              >
                loop
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence initial={false}>
          {showItems && navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <motion.button
                key={item.name}
                initial={isChatPage ? { opacity: 0, x: -8 } : false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                onClick={() => {
                  navigate(item.path);
                  if (isChatPage) setExpanded(false);
                }}
                className="floating-nav__item relative px-4 py-2 flex items-center gap-2 transition-all group"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                className="absolute inset-0 bg-slate-900 dark:bg-gradient-to-r dark:from-teal-300 dark:to-sky-400 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-1.5">
                <Icon size={16} className={isActive ? "text-white dark:text-slate-900" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white"} />
                <span className={`floating-nav__label text-[13px] font-medium ${isActive ? "text-white dark:text-slate-900" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white"}`}>
                  {item.name}
                </span>
                {item.name === "Chat" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                    {unreadCount}
                  </span>
                )}
              </div>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Theme Toggle */}
        <AnimatePresence initial={false}>
          {showItems && (
            <motion.button
              initial={isChatPage ? { opacity: 0, x: -8 } : false}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              onClick={toggleTheme}
              className="floating-nav__theme ml-2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default FloatingNav;
