import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import StarBackground from "../components/StarBackground";
import Toast from "../components/Toast";

function Register() {
  const navigate = useNavigate();

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = () => {
    let newErrors = {};

    if (form.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";
    if (form.username.trim().length < 3)
      newErrors.username = "Username must be at least 3 characters";
    if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email address";
    if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.city.trim().length < 2)
      newErrors.city = "City must be at least 2 characters";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showToast("Please fix the highlighted errors", "error");
    }

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

      showToast("Registration successful 🎉", "success");

      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 1200);

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setLoading(false);
      showToast("Registration failed. Try again.", "error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
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
          className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl"
        >
          {!success ? (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8">
                Create Account 🚀
              </h2>

              <div className="space-y-5 sm:space-y-6">
                {["name", "username", "email", "city"].map((field) => (
                  <div key={field}>
                    <input
                      type="text"
                      name={field}
                      value={form[field]}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      className={`w-full bg-transparent border-b py-2 text-sm sm:text-base text-white focus:outline-none transition
                      ${
                        errors[field]
                          ? "border-red-500"
                          : "border-zinc-600 focus:border-purple-500"
                      }`}
                    />
                  </div>
                ))}

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Password"
                    className={`w-full bg-transparent border-b py-2 pr-10 text-sm sm:text-base text-white focus:outline-none transition
                    ${
                      errors.password
                        ? "border-red-500"
                        : "border-zinc-600 focus:border-purple-500"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <motion.button
                  onClick={handleRegister}
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
                    "Register"
                  )}
                </motion.button>
              </div>

              <p className="text-center text-zinc-400 text-xs sm:text-sm mt-5 sm:mt-6">
                Already have an account?{" "}
                <span
                  onClick={() => navigate("/login")}
                  className="text-purple-400 cursor-pointer hover:underline"
                >
                  Login
                </span>
              </p>
            </>
          ) : (
            <div className="text-center text-white">
              <h2 className="text-lg sm:text-2xl font-bold">
                Registration Successful 🎉
              </h2>
              <p className="text-zinc-400 mt-2 text-sm">
                Redirecting to login...
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}

export default Register;