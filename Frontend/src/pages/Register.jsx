import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, MapPin, Sun, Moon, ArrowUpRight } from "lucide-react";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAuth();
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    city: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  // --- Parallax Effect Logic ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["1.2deg", "-1.2deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-1.2deg", "1.2deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = () => {
    let newErrors = {};
    if (form.name.trim().length < 2) newErrors.name = "Too short";
    if (form.username.trim().length < 3) newErrors.username = "Too short";
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email";
    if (form.password.length < 6) newErrors.password = "Min 6 chars";
    if (form.city.trim().length < 2) newErrors.city = "Required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) showToast("Check the highlighted fields", "error");
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await API.post("/auth/register", form);
      showToast("Registration successful! 🎉", "success");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setLoading(false);
      showToast("Registration failed. Try again.", "error");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-10 transition-colors duration-500 overflow-hidden"
      style={{ backgroundColor: isDark ? "#080a0c" : "#fbfcf8" }}
    >
      <Toast toast={toast} setToast={setToast} />

      {/* Header: Branding & Toggle */}
      <div className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-[100] pointer-events-none">
        <Link to="/" className="flex items-center space-x-2 backdrop-blur-md px-4 py-2 rounded-full border shadow-sm pointer-events-auto transition-all hover:scale-105"
          style={{ backgroundColor: isDark ? "rgba(24, 24, 27, 0.8)" : "rgba(255, 255, 255, 0.8)", borderColor: isDark ? "#27272a" : "#e4e4e7" }}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDark ? 'bg-white' : 'bg-black'}`}>
            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-black' : 'bg-white'}`} />
          </div>
          <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Urban Loop</span>
        </Link>
        <button onClick={toggleTheme} className="p-3 rounded-full shadow-md transition-all hover:scale-110 pointer-events-auto border"
          style={{ backgroundColor: isDark ? "#18181b" : "#ffffff", borderColor: isDark ? "#27272a" : "#f4f4f5", color: isDark ? "#facc15" : "#52525b" }}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <motion.div
        onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="flex flex-col md:flex-row w-full max-w-6xl min-h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border transition-colors duration-500 relative z-10"
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
      >
        {/* LEFT FORM SIDE */}
        <div className="w-full md:w-[50%] p-8 md:p-14 lg:p-20 flex flex-col justify-center order-2 md:order-1 relative z-20"
          style={{ backgroundColor: isDark ? "#0f1216" : "#ffffff" }}>

          <div className="max-w-[400px] mx-auto w-full relative z-30" style={{ transform: "translateZ(30px)" }}>
            <h2 className={`text-4xl font-semibold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>Create account</h2>
            <p className="text-zinc-500 mb-10 font-medium">Join the Loop in a few seconds.</p>

            {!success ? (
              <div
                className="space-y-4"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    e.preventDefault();
                    handleRegister();
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Full name"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none transition-all ${errors.name ? 'ring-1 ring-red-500' : ''}`}
                      style={{ backgroundColor: isDark ? "#1a1d21" : "#f3f5f3", color: isDark ? "#fff" : "#000" }} />
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">@</span>
                    <input name="username" value={form.username} onChange={handleChange} placeholder="username"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none transition-all ${errors.username ? 'ring-1 ring-red-500' : ''}`}
                      style={{ backgroundColor: isDark ? "#1a1d21" : "#f3f5f3", color: isDark ? "#fff" : "#000" }} />
                  </div>
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input name="email" value={form.email} onChange={handleChange} placeholder="Email"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none transition-all ${errors.email ? 'ring-1 ring-red-500' : ''}`}
                    style={{ backgroundColor: isDark ? "#1a1d21" : "#f3f5f3", color: isDark ? "#fff" : "#000" }} />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Password"
                    className={`w-full pl-11 pr-12 py-3.5 rounded-2xl outline-none transition-all ${errors.password ? 'ring-1 ring-red-500' : ''}`}
                    style={{ backgroundColor: isDark ? "#1a1d21" : "#f3f5f3", color: isDark ? "#fff" : "#000" }} />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input name="city" value={form.city} onChange={handleChange} placeholder="City"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none transition-all ${errors.city ? 'ring-1 ring-red-500' : ''}`}
                    style={{ backgroundColor: isDark ? "#1a1d21" : "#f3f5f3", color: isDark ? "#fff" : "#000" }} />
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRegister} disabled={loading}
                  className="w-full mt-6 py-4 font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-zinc-200/50 dark:shadow-none"
                  style={{ backgroundColor: isDark ? "#ffffff" : "#1a1d21", color: isDark ? "#000000" : "#ffffff" }}>
                  {loading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <span className="flex items-center gap-2">Create account <ArrowUpRight size={18} /></span>}
                </motion.button>

                {/* SIGN IN LINK RE-IMPLEMENTED TO ENSURE CLICKABILITY */}
                <div className="mt-10 text-center relative z-[50]">
                  <p className="text-zinc-500 text-sm font-medium">
                    Already have one?{" "}
                    <Link
                      to="/login"
                      className={`font-bold transition-all hover:underline underline-offset-4 decoration-2 ${isDark ? 'text-white hover:text-purple-400' : 'text-zinc-900 hover:text-purple-600'}`}
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowUpRight className="text-white rotate-45" size={32} />
                </motion.div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Welcome to the Loop!</h3>
                <p className="text-zinc-500 mt-2">Redirecting to login...</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT DECORATIVE SIDE */}
        <div className="w-full md:w-[50%] p-12 lg:p-16 flex flex-col justify-between overflow-hidden order-1 md:order-2 relative z-10"
          style={{ backgroundColor: isDark ? "#131d1a" : "#f9f6e5" }}>

          <div className="absolute inset-0 transition-opacity duration-700"
            style={{
              background: isDark
                ? "radial-gradient(circle at 70% 30%, rgba(52, 211, 153, 0.15) 0%, transparent 50%)"
                : "radial-gradient(circle at 70% 30%, rgba(254, 215, 170, 0.6) 0%, transparent 60%)"
            }}
          />

          <div className="relative z-10 self-start">
            <div className="px-4 py-1.5 backdrop-blur-md rounded-full border w-fit"
              style={{ backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)", borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.4)" }}>
              <span className={`text-xs font-semibold uppercase tracking-tight ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Become a local</span>
            </div>
          </div>

          <div className="relative z-10" style={{ transform: "translateZ(60px)" }}>
            <h1 className="text-6xl lg:text-7xl font-serif leading-[1.1] tracking-tight"
              style={{ color: isDark ? "#ffffff" : "#1a1c1e" }}>
              Find your <br /> <span className="italic font-normal opacity-80">people.</span>
            </h1>
            <p className={`mt-8 max-w-xs text-lg leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              We only let in folks from your city. No spam, no strangers, no noise — just neighbours.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;
