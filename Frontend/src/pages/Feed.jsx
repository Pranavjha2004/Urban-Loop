import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Feed() {
  const [posts, setPosts] = useState([]);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchFeed = async () => {
      const res = await API.get("/posts/feed");
      setPosts(res.data.posts || res.data);
    };

    fetchFeed();
  }, []);

  return (
    <div>
      <h2>Feed</h2>

      {posts.map((post) => (
        <div key={post._id}>
          <h4>{post.user?.name}</h4>
          <p>{post.caption}</p>

          {/* Show image if exists */}
          {post.image && (
            <img
              src={post.image}
              alt="post"
              style={{ width: "300px", borderRadius: "8px" }}
            />
          )}

          <hr />
        </div>
      ))}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Feed;
