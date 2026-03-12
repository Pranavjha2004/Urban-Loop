import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Users, Compass, User } from "lucide-react";
import { useRef, useEffect, useState } from "react";

function FloatingNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { name: "Feed", icon: Home, path: "/feed" },
    { name: "Communities", icon: Users, path: "/communities" },
    { name: "Explore", icon: Compass, path: "/explore" },
    { name: "Profile", icon: User, path: "/profile/me" },
  ];

  // 🔥 Detect Scroll For Dynamic Appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🧲 Magnetic Effect
  const handleMouseMove = (e) => {
    const item = e.currentTarget;
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const moveX = (x - rect.width / 2) * 0.15;
    const moveY = (y - rect.height / 2) * 0.25;

    item.style.transform = `translate(${moveX}px, ${moveY}px)`;
  };

  const resetPosition = (e) => {
    e.currentTarget.style.transform = `translate(0px, 0px)`;
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        ref={navRef}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
          ${
            scrolled
              ? "bg-zinc-900/70 backdrop-blur-2xl border border-white/20 shadow-2xl"
              : "bg-white/5 backdrop-blur-xl border border-white/10"
          }`}
      >
        {/* Subtle Inner Contrast Layer */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/5 to-black/20 pointer-events-none" />

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              onMouseMove={handleMouseMove}
              onMouseLeave={resetPosition}
              className="relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
            >
              {/* Morphing Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(124,58,237,0.6)]"
                />
              )}

              <span
                className={`relative z-10 flex items-center gap-2 transition-colors ${
                  isActive
                    ? "text-white drop-shadow-md"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {item.name}
              </span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}

export default FloatingNav;