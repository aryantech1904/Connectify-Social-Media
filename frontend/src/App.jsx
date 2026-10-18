
import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Home,
  Search,
  Heart,
  MessageCircle,
  Send,
  LogOut,
  Plus,
  RefreshCw,
} from "lucide-react";
import Auth from "./AuthTemp.jsx";
import api from "./api/api";
import "./App.css";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f5fb",
    color: "#272044",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "15px max(20px, calc((100% - 1050px) / 2))",
    background: "#ffffff",
    borderBottom: "1px solid #e9e5f3",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#6d35d5",
    fontSize: 23,
    fontWeight: 800,
  },
  layout: {
    width: "min(680px, calc(100% - 28px))",
    margin: "28px auto",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #ebe7f4",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    boxShadow: "0 5px 20px rgba(40, 25, 75, 0.035)",
  },
  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: 13,
    border: "1px solid #e5e0ef",
    borderRadius: 12,
    background: "#faf9ff",
    color: "#272044",
    font: "inherit",
    outlineColor: "#7c3aed",
  },
  primary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "11px 17px",
    border: "none",
    borderRadius: 11,
    background: "#7138d4",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "9px 12px",
    border: "1px solid #e5e0ef",
    borderRadius: 10,
    background: "#ffffff",
    color: "#514568",
    fontWeight: 600,
    cursor: "pointer",
  },
  muted: { color: "#827b94", fontSize: 13 },
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("connectify_token"))
  );
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [postsResponse, userResponse] = await Promise.all([
        api.get("/posts"),
        api.get("/users/me"),
      ]);

      const postData = postsResponse.data;
      const userData = userResponse.data;

      const receivedPosts = Array.isArray(postData)
        ? postData
        : postData.posts || [];

      setPosts(receivedPosts);
      setCurrentUser(userData.user || userData);
    } catch (err) {
      const status = err.response?.status;

      if (status === 401) {
        localStorage.removeItem("connectify_token");
        setIsLoggedIn(false);
        setCurrentUser(null);
        setPosts([]);
        setError("Your session expired. Please log in again.");
      } else {
        setError(
          err.response?.data?.message ||
            "Could not load posts. Please check your backend server."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn, loadData]);

  function handleLogin() {
    setError("");
    setNotice("");
    setIsLoggedIn(true);
  }

  function handleLogout() {
    localStorage.removeItem("connectify_token");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setPosts([]);
    setContent("");
    setNotice("");
    setError("");
  }

  async function handleCreatePost(e) {
    e.preventDefault();

    const text = content.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      await api.post("/posts", { content: text });
      setContent("");
      setNotice("Your post was published successfully!");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not publish your post."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(postId) {
    setError("");

    try {
      await api.post(`/posts/${postId}/like`);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not like this post."
      );
    }
  }

  async function handleComment(e, postId) {
    e.preventDefault();

    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    setError("");

    try {
      await api.post(`/posts/${postId}/comments`, { text });

      setCommentInputs((previous) => ({
        ...previous,
        [postId]: "",
      }));

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not add your comment."
      );
    }
  }

  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  const visiblePosts = posts.filter((post) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    const authorName =
      typeof post.author === "object"
        ? `${post.author.name || ""} ${post.author.username || ""}`
        : "";

    return `${post.content || ""} ${authorName}`
      .toLowerCase()
      .includes(query);
  });

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <Users size={29} />
          <span>Connectify</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...styles.muted, display: "none" }}>
            Welcome back!
          </span>
          <button
            type="button"
            style={styles.secondary}
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      <main style={styles.layout}>
        <section style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 27, margin: "0 0 7px" }}>
            Your Community
          </h1>
          <p style={{ ...styles.muted, fontSize: 14, margin: 0 }}>
            Share your thoughts and stay connected.
          </p>
        </section>

        {currentUser && (
          <section style={styles.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "#eee6ff",
                  color: "#7138d4",
                  fontSize: 19,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {(currentUser.name || currentUser.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {currentUser.name || currentUser.username || "Connectify User"}
                </strong>
                <p style={{ ...styles.muted, margin: "4px 0 0" }}>
                  {currentUser.username
                    ? `@${currentUser.username}`
                    : currentUser.email || "Welcome to Connectify"}
                </p>
              </div>
            </div>
          </section>
        )}

        <section style={styles.card}>
          <h2
            style={{
              fontSize: 18,
              margin: "0 0 15px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Plus size={20} color="#7138d4" />
            Create a post
          </h2>

          <form onSubmit={handleCreatePost}>
            <textarea
              style={{
                ...styles.input,
                minHeight: 110,
                resize: "vertical",
                marginBottom: 12,
              }}
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              required
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <span style={styles.muted}>{content.length}/2000</span>

              <button
                type="submit"
                style={{
                  ...styles.primary,
                  opacity: submitting ? 0.65 : 1,
                }}
                disabled={submitting || !content.trim()}
              >
                <Send size={16} />
                {submitting ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </form>
        </section>

        <section style={{ ...styles.card, padding: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Search size={20} color="#827b94" />
            <input
              style={{
                ...styles.input,
                border: "none",
                background: "transparent",
              }}
              placeholder="Search posts or usernames..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              title="Refresh posts"
              aria-label="Refresh posts"
              style={styles.secondary}
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            style={{
              ...styles.card,
              color: "#b91c1c",
              background: "#fff7f7",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            style={{
              ...styles.card,
              color: "#166534",
              background: "#f0fdf4",
              marginBottom: 16,
            }}
          >
            {notice}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "25px 2px 15px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 21 }}>
            <Home
              size={20}
              style={{ verticalAlign: "middle", marginRight: 8 }}
            />
            Latest Posts
          </h2>
          <span style={styles.muted}>{visiblePosts.length} posts</span>
        </div>

        {loading && posts.length === 0 && (
          <section style={styles.card}>
            <p style={{ margin: 0 }}>Loading posts...</p>
          </section>
        )}

        {!loading && visiblePosts.length === 0 && !error && (
          <section style={{ ...styles.card, textAlign: "center", padding: 35 }}>
            <MessageCircle
              size={34}
              color="#9a7bd9"
              style={{ marginBottom: 10 }}
            />
            <h3 style={{ margin: "0 0 8px" }}>
              {search ? "No matching posts" : "No posts yet"}
            </h3>
            <p style={{ ...styles.muted, margin: 0 }}>
              {search
                ? "Try a different search term."
                : "Be the first to share something with the community!"}
            </p>
          </section>
        )}

        {visiblePosts.map((post) => {
          const author =
            post.author && typeof post.author === "object"
              ? post.author
              : {};

          const likes = Array.isArray(post.likes) ? post.likes : [];
          const comments = Array.isArray(post.comments) ? post.comments : [];

          const myId = currentUser?._id || currentUser?.id;

          const alreadyLiked = likes.some((like) => {
            const likeId =
              typeof like === "object" ? like._id || like.id : like;
            return myId && String(likeId) === String(myId);
          });

          return (
            <article key={post._id} style={styles.card}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#eee6ff",
                    color: "#7138d4",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {(author.name || author.username || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {author.name || author.username || "Connectify User"}
                  </strong>
                  <p style={{ ...styles.muted, margin: "4px 0 0" }}>
                    {author.username ? `@${author.username} · ` : ""}
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleString()
                      : "Recently"}
                  </p>
                </div>
              </div>

              <p
                style={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  lineHeight: 1.7,
                  margin: "0 0 18px",
                }}
              >
                {post.content}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  paddingTop: 13,
                  borderTop: "1px solid #f0edf6",
                }}
              >
                <button
                  type="button"
                  style={{
                    ...styles.secondary,
                    color: alreadyLiked ? "#dc3565" : "#514568",
                  }}
                  onClick={() => handleLike(post._id)}
                >
                  <Heart
                    size={17}
                    fill={alreadyLiked ? "currentColor" : "none"}
                  />
                  {alreadyLiked ? "Liked" : "Like"} ({likes.length})
                </button>

                <span
                  style={{
                    ...styles.muted,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <MessageCircle size={17} />
                  {comments.length} comments
                </span>
              </div>

              {comments.length > 0 && (
                <div
                  style={{
                    marginTop: 15,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  {comments.map((comment, index) => {
                    const commentUser =
                      comment.user && typeof comment.user === "object"
                        ? comment.user
                        : {};

                    return (
                      <div
                        key={comment._id || `${post._id}-comment-${index}`}
                        style={{
                          background: "#f8f6fc",
                          padding: 12,
                          borderRadius: 12,
                        }}
                      >
                        <strong style={{ fontSize: 13 }}>
                          {commentUser.name ||
                            commentUser.username ||
                            "User"}
                        </strong>
                        <p
                          style={{
                            margin: "5px 0 0",
                            fontSize: 14,
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {comment.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              <form
                onSubmit={(e) => handleComment(e, post._id)}
                style={{
                  display: "flex",
                  gap: 9,
                  marginTop: 15,
                }}
              >
                <input
                  style={{ ...styles.input, minWidth: 0 }}
                  placeholder="Write a comment..."
                  value={commentInputs[post._id] || ""}
                  onChange={(e) =>
                    setCommentInputs((previous) => ({
                      ...previous,
                      [post._id]: e.target.value,
                    }))
                  }
                  maxLength={1000}
                  required
                />

                <button
                  type="submit"
                  style={styles.primary}
                  aria-label="Send comment"
                  title="Send comment"
                >
                  <Send size={17} />
                </button>
              </form>
            </article>
          );
        })}

        <p
          style={{
            ...styles.muted,
            textAlign: "center",
            padding: "10px 0 30px",
          }}
        >
          Connectify · Connect with your community
        </p>
      </main>
    </div>
  );
}

export default App;