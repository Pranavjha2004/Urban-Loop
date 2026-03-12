import Chat from "../components/Chat";
import { useAuth } from "../context/AuthContext";

function ChatPage() {
  const { user } = useAuth();

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>Real Time Chat Test</h2>

      <p>Your User ID: {user._id}</p>

      {/* Replace with the ID of another user */}
      <Chat receiverId="6996a3653cd9ca5668378502" />
    </div>
  );
}

export default ChatPage;