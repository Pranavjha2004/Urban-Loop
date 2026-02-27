import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import StarBackground from "../components/StarBackground";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768);
  }, []);

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

    await API.post("/auth/login", {
      email,
      password,
      rememberMe, // optional flag
    });

    // 🔥 IMPORTANT: update auth state
    await checkAuth();

    showToast("Login successful 🚀", "success");

    setTimeout(() => {
      navigate("/feed");
    }, 1000);

  } catch (err) {
    setLoading(false);
    showToast("Login failed. Check credentials.", "error");
  }
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <Toast toast={toast} setToast={setToast} />

      <div
        onMouseMove={(e) =>
          isDesktop &&
          setMousePosition({ x: e.clientX, y: e.clientY })
        }
        className="relative min-h-screen flex items-center justify-center bg-zinc-950 overflow-hidden px-4"
      >
        <StarBackground />

        {isDesktop && (
          <motion.div
            className="pointer-events-none fixed w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              x: mousePosition.x - 150,
              y: mousePosition.y - 150,
            }}
            transition={{ type: "tween", ease: "linear", duration: 0.1 }}
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md sm:max-w-lg bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 sm:p-8 shadow-2xl"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
            Welcome Back 👋
          </h2>

          <div className="space-y-6">
            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-b border-zinc-600 py-2 text-white text-sm sm:text-base focus:outline-none focus:border-purple-500 transition"
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-b border-zinc-600 py-2 pr-10 text-white text-sm sm:text-base focus:outline-none focus:border-purple-500 transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-sm text-zinc-400">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="w-4 h-4 accent-purple-600 bg-zinc-800 border-zinc-600"
                />
                <span>Remember Me</span>
              </label>
            </div>

            {/* Button */}
            <motion.button
              onClick={handleLogin}
              disabled={loading}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 sm:py-3 rounded-xl font-semibold text-white shadow-lg disabled:opacity-60"
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                "Login"
              )}
            </motion.button>
          </div>

          <p className="text-center text-zinc-400 text-xs sm:text-sm mt-6">
            Don’t have an account?{" "}
            <Link to="/register" className="text-purple-400 hover:underline">
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}

export default Login;