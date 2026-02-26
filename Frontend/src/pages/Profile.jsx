import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function Profile() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userRes = await API.get(`/users/${id}`);
        setUser(userRes.data);

        const postsRes = await API.get("/posts/feed");
        const userPosts = postsRes.data.posts.filter(
          (post) => post.user._id === id
        );

        setPosts(userPosts);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProfile();
  }, [id]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>@{user.username}</p>
      <p>City: {user.city}</p>
      <p>{user.bio}</p>

      <p>
        Followers: {user.followers.length} | Following:{" "}
        {user.following.length}
      </p>

      <hr />

      <h3>Posts</h3>

      {posts.map((post) => (
        <div key={post._id}>
          <p>{post.caption}</p>
          {post.image && (
            <img
              src={post.image}
              alt="post"
              style={{ width: "250px" }}
            />
          )}
          <hr />
        </div>
      ))}
    </div>
  );
}

export default Profile;