import { useState, useRef } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Sun, Moon, ArrowUpRight } from "lucide-react";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { setUser, theme, toggleTheme } = useAuth();
  const isDark = theme === "dark";

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // --- Parallax Effect Logic ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["1deg", "-1deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-1deg", "1deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("Please enter email and password", "error");
      return;
    }
    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", { email, password });
      if (data.token) localStorage.setItem("token", data.token);
      setUser(data.user);
      showToast("Login successful! 🚀", "success");
      navigate(data.user?.role === "admin" ? "/admin" : "/feed", { replace: true });
    } catch (err) {
      setLoading(false);
      showToast("Login failed. Check credentials.", "error");
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-10 transition-colors duration-500 overflow-hidden"
      style={{ backgroundColor: isDark ? "#080a0c" : "#fbfcf8" }}
    >
      <Toast toast={toast} setToast={setToast} />

      {/* Header: Branding & Toggle */}
      <div className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-50 pointer-events-none">
        {/* Navigation Branding */}
        <Link 
          to="/" 
          className="flex items-center space-x-2 backdrop-blur-md px-4 py-2 rounded-full border shadow-sm pointer-events-auto transition-all hover:scale-105 active:scale-95 duration-500"
          style={{ 
            backgroundColor: isDark ? "rgba(24, 24, 27, 0.8)" : "rgba(255, 255, 255, 0.8)",
            borderColor: isDark ? "#27272a" : "#e4e4e7"
          }}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDark ? 'bg-white' : 'bg-black'}`}>
            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-black' : 'bg-white'}`} />
          </div>
          <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Urban Loop</span>
        </Link>

        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full shadow-md transition-all hover:scale-110 pointer-events-auto border"
          style={{ 
            backgroundColor: isDark ? "#18181b" : "#ffffff",
            borderColor: isDark ? "#27272a" : "#f4f4f5",
            color: isDark ? "#facc15" : "#52525b"
          }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Main Card with Parallax */}
      <motion.div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row w-full max-w-6xl min-h-[650px] rounded-[3rem] overflow-hidden shadow-2xl border transition-colors duration-500"
      >
        
        {/* LEFT SIDE - Gradient Aesthetic */}
        <div 
          className="relative w-full md:w-[55%] p-12 lg:p-16 flex flex-col justify-between overflow-hidden transition-colors duration-700"
          style={{ backgroundColor: isDark ? "#131d1a" : "#e3f4ee" }}
        >
          {/* Animated Background Glows */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5] 
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[100px] transition-colors duration-700"
            style={{ backgroundColor: isDark ? "rgba(36, 33, 22, 0.3)" : "rgba(255, 248, 225, 0.9)" }}
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, 20, 0] 
            }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[100px] transition-colors duration-700"
            style={{ backgroundColor: isDark ? "rgba(36, 26, 22, 0.3)" : "rgba(252, 233, 225, 0.9)" }}
          />
          
          <div className="relative z-10" style={{ transform: "translateZ(50px)" }}>
             <div 
              className="px-4 py-1.5 backdrop-blur-md rounded-full border w-fit"
              style={{ 
                backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.4)",
                borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.3)"
              }}
             >
               <span className={`text-xs font-semibold uppercase tracking-tight ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>Welcome back</span>
             </div>
          </div>

          <div className="relative z-10" style={{ transform: "translateZ(80px)" }}>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-6xl lg:text-7xl font-serif leading-[1.1] tracking-tight"
              style={{ color: isDark ? "#ffffff" : "#1a1c1e" }}
            >
              The city <br /> <span className="italic font-normal opacity-80">missed you.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`mt-8 max-w-xs text-lg leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
            >
              Pick up where you left off. New posts, new rooms, and new neighbors are waiting for you.
            </motion.p>
          </div>
        </div>

        {/* RIGHT SIDE - Form */}
        <div 
          className="w-full md:w-[45%] p-10 md:p-16 lg:p-20 flex flex-col justify-center transition-colors duration-500"
          style={{ backgroundColor: isDark ? "#0f1216" : "#ffffff" }}
        >
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-[340px] mx-auto w-full"
            style={{ transform: "translateZ(30px)" }}
          >
            <h2 className={`text-4xl font-semibold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>Sign in</h2>
            <p className="text-zinc-500 mb-10 font-medium">Enter your details to continue.</p>

            <div
              className="space-y-6"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  e.preventDefault();
                  handleLogin();
                }
              }}
            >
              {/* Email */}
              <div className="group space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1 transition-colors group-focus-within:text-indigo-500">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aarav@urbanloop.app"
                    className="w-full pl-12 pr-4 py-4 border-none rounded-2xl outline-none transition-all shadow-sm focus:shadow-md"
                    style={{ 
                      backgroundColor: isDark ? "#1a1d21" : "#f3f5f3",
                      color: isDark ? "#ffffff" : "#18181b"
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1 transition-colors group-focus-within:text-indigo-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 border-none rounded-2xl outline-none transition-all shadow-sm focus:shadow-md"
                    style={{ 
                      backgroundColor: isDark ? "#1a1d21" : "#f3f5f3",
                      color: isDark ? "#ffffff" : "#18181b"
                    }}
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: isDark ? "0 0 20px rgba(255,255,255,0.1)" : "0 20px 40px -10px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogin}
                disabled={loading}
                className="w-full mt-4 py-4 font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl"
                style={{ 
                  backgroundColor: isDark ? "#ffffff" : "#25282c",
                  color: isDark ? "#000000" : "#ffffff"
                }}
              >
                {loading ? (
                  <div className={`w-5 h-5 border-2 rounded-full animate-spin ${isDark ? 'border-black border-t-transparent' : 'border-white border-t-transparent'}`} />
                ) : (
                  <span className="flex items-center gap-2">Sign in <ArrowUpRight size={18}/></span>
                )}
              </motion.button>
            </div>

            <p className="mt-12 text-center text-zinc-500 text-sm font-medium">
              New here? <Link to="/register" className={`font-bold hover:underline underline-offset-4 decoration-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Create an account</Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
