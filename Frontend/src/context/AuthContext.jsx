import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";
import socket from "../socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- New Theme State ---
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const checkAuth = async () => {
    try {
      const { data } = await API.get("/auth/me");
      setUser(data);
      return data;
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // --- Theme Effect ---
// Inside your AuthContext useEffect
useEffect(() => {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  
  if (theme === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark"; // 👈 Add this
  } else {
    root.classList.add("light");
    root.style.colorScheme = "light"; // 👈 Add this
  }
  
  localStorage.setItem("theme", theme);
}, [theme]);

const toggleTheme = () => {
  setTheme((prev) => (prev === "dark" ? "light" : "dark"));
};

  // CONNECT USER TO SOCKET
  useEffect(() => {
    if (!user?._id) return;
    const announceOnline = () => {
      socket.emit("user-online", user._id);
      socket.emit("get-online-users");
    };

    socket.connect();
    announceOnline();
    socket.on("connect", announceOnline);

    return () => {
      socket.off("connect", announceOnline);
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        checkAuth,
        socket,
        theme,        // Exported
        toggleTheme   // Exported
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
