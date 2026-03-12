// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import connectDB from "./config/db.js";

// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import postRoutes from "./routes/postRoutes.js";
// import messageRoutes from "./routes/messageRoutes.js";

// import http from "http";
// import { Server } from "socket.io";

// connectDB();

// const app = express();

// /* ------------------- MIDDLEWARES ------------------- */

// app.use(express.json());
// app.use(cookieParser());

// app.use(
//   cors({
//     origin: ["http://localhost:5173", "http://localhost:3000"],
//     credentials: true,
//   })
// );

// /* ------------------- ROUTES ------------------- */

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/posts", postRoutes);
// app.use("/api/messages", messageRoutes);

// /* ------------------- TEST ROUTE ------------------- */

// app.get("/", (req, res) => {
//   res.send("Backend API Running 🚀");
// });

// /* ------------------- SOCKET SERVER ------------------- */

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//   },
// });

// /* ------------------- ONLINE USERS STORAGE ------------------- */

// let onlineUsers = [];

// /* ------------------- SOCKET CONNECTION ------------------- */

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   /* -------- ADD USER WHEN THEY LOGIN -------- */

//   socket.on("addUser", (userId) => {
//     const userExists = onlineUsers.find((user) => user.userId === userId);

//     if (!userExists) {
//       onlineUsers.push({
//         userId,
//         socketId: socket.id,
//       });
//     }

//     console.log("Online users:", onlineUsers);

//     io.emit("getUsers", onlineUsers);
//   });

//   /* -------- SEND MESSAGE -------- */

//   socket.on("sendMessage", ({ senderId, receiverId, text }) => {
//     const receiver = onlineUsers.find(
//       (user) => user.userId === receiverId
//     );

//     if (receiver) {
//       io.to(receiver.socketId).emit("receiveMessage", {
//         senderId,
//         text,
//       });
//     }
//   });

//   /* -------- USER DISCONNECT -------- */

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);

//     onlineUsers = onlineUsers.filter(
//       (user) => user.socketId !== socket.id
//     );

//     io.emit("getUsers", onlineUsers);
//   });
// });

// /* ------------------- START SERVER ------------------- */

// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import http from "http";
import { Server } from "socket.io";

/* ------------------- CONNECT DATABASE ------------------- */

connectDB();

/* ------------------- EXPRESS APP ------------------- */

const app = express();

/* ------------------- MIDDLEWARES ------------------- */

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

/* ------------------- API ROUTES ------------------- */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);

/* ------------------- TEST ROUTE ------------------- */

app.get("/", (req, res) => {
  res.send("Backend API Running 🚀");
});

/* ------------------- CREATE SERVER ------------------- */

const server = http.createServer(app);

/* ------------------- SOCKET.IO SETUP ------------------- */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

/* ------------------- ONLINE USERS STORAGE ------------------- */

let onlineUsers = [];

/* ------------------- SOCKET CONNECTION ------------------- */

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  /* ------------------- ADD USER ------------------- */

  socket.on("addUser", (userId) => {
    const userExists = onlineUsers.find((user) => user.userId === userId);

    if (!userExists) {
      onlineUsers.push({
        userId,
        socketId: socket.id,
      });
    }

    console.log("🟢 Online users:", onlineUsers);

    io.emit("getUsers", onlineUsers);
  });

  /* ------------------- SEND MESSAGE ------------------- */

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    console.log("📩 Message received:", {
      senderId,
      receiverId,
      text,
    });

    const receiver = onlineUsers.find(
      (user) => user.userId === receiverId
    );

    if (receiver) {
      io.to(receiver.socketId).emit("receiveMessage", {
        senderId,
        receiverId,
        text,
      });

      console.log("✅ Message sent to:", receiverId);
    } else {
      console.log("⚠️ Receiver not online");
    }
  });

  /* ------------------- DISCONNECT ------------------- */

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    onlineUsers = onlineUsers.filter(
      (user) => user.socketId !== socket.id
    );

    io.emit("getUsers", onlineUsers);

    console.log("🟢 Online users:", onlineUsers);
  });
});

/* ------------------- START SERVER ------------------- */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});