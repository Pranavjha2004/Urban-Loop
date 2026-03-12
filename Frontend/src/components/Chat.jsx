// // import { useEffect, useState } from "react";
// // import { socket } from "../socket";

// // function Chat({ userId }) {
// //   const [message, setMessage] = useState("");
// //   const [messages, setMessages] = useState([]);

// //   useEffect(() => {
// //     socket.emit("addUser", userId);

// //     socket.on("receiveMessage", (data) => {
// //       setMessages((prev) => [...prev, data]);
// //     });
// //   }, [userId]);

// //   const sendMessage = () => {
// //     socket.emit("sendMessage", {
// //       senderId: userId,
// //       receiverId: "RECEIVER_ID",
// //       text: message,
// //     });

// //     setMessage("");
// //   };

// //   return (
// //     <div>
// //       {messages.map((m, i) => (
// //         <p key={i}>{m.text}</p>
// //       ))}

// //       <input
// //         value={message}
// //         onChange={(e) => setMessage(e.target.value)}
// //       />

// //       <button onClick={sendMessage}>Send</button>
// //     </div>
// //   );
// // }

// // export default Chat;
// import { useEffect, useState } from "react";
// import { socket } from "../socket";
// import { useAuth } from "../context/AuthContext";

// function Chat({ receiverId }) {
//   const { user } = useAuth();

//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);

//   /* ---------------- RECEIVE MESSAGE ---------------- */

//   useEffect(() => {
//     socket.on("receiveMessage", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     return () => {
//       socket.off("receiveMessage");
//     };
//   }, []);

//   /* ---------------- SEND MESSAGE ---------------- */

//   const sendMessage = () => {
//     if (!message.trim()) return;

//     const newMessage = {
//       senderId: user._id,
//       receiverId,
//       text: message,
//     };

//     socket.emit("sendMessage", newMessage);

//     /* show message instantly in UI */
//     setMessages((prev) => [...prev, newMessage]);

//     setMessage("");
//   };

//   return (
//     <div>
//       <div>
//         {messages.map((m, i) => (
//           <p key={i}>
//             <b>{m.senderId === user._id ? "Me" : "Them"}:</b> {m.text}
//           </p>
//         ))}
//       </div>

//       <input
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         placeholder="Type message..."
//       />

//       <button onClick={sendMessage}>Send</button>
//     </div>
//   );
// }

// export default Chat;




import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";

function Chat({ receiverId }) {
  const { user } = useAuth();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const chatEndRef = useRef(null);

  /* ---------------- REGISTER USER SOCKET ---------------- */

  useEffect(() => {
    if (user?._id) {
      socket.emit("addUser", user._id);
    }
  }, [user]);

  /* ---------------- RECEIVE MESSAGE ---------------- */

  useEffect(() => {
    const handleReceive = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receiveMessage", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, []);

  /* ---------------- AUTO SCROLL ---------------- */

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- SEND MESSAGE ---------------- */

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      senderId: user._id,
      receiverId,
      text: message,
    };

    socket.emit("sendMessage", newMessage);

    /* show message instantly in UI */
    setMessages((prev) => [...prev, newMessage]);

    setMessage("");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      
      {/* CHAT BOX */}
      <div
        style={{
          height: "400px",
          overflowY: "auto",
          border: "1px solid #333",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "8px" }}>
            <b>{m.senderId === user._id ? "Me" : "Them"}:</b> {m.text}
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          style={{ flex: 1, padding: "8px" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />

        <button
          onClick={sendMessage}
          style={{
            padding: "8px 16px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;