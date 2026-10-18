
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
  UserRound,
  UserPlus,
  UserCheck,
  X,
  ArrowLeft,
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

function getId(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
}

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

  // Profile and followers/following states
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [listUsers, setListUsers] = useState([]);
  const [listType, setListType] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

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
    closeProfile();
  }

  function closeProfile() {
    setSelectedProfile(null);
    setProfileError("");
    setListUsers([]);
    setListType("");
  }

  async function openProfile(username) {
    if (!username) return;

    setProfileLoading(true);
    setProfileError("");
    setListUsers([]);
    setListType("");
    setSelectedProfile(null);

    try {
      const myUsername = currentUser?.username?.toLowerCase();

      if (myUsername && username.toLowerCase() === myUsername) {
        setSelectedProfile(currentUser);
      } else {
        const response = await api.get(
          `/users/${encodeURIComponent(username)}`
        );
        setSelectedProfile(response.data.user || response.data);
      }
    } catch (err) {
      setProfileError(
        err.response?.data?.message || "Could not load this profile."
      );
    } finally {
      setProfileLoading(false);
    }
  }

  async function openUserList(type) {
    if (!selectedProfile?.username) return;

    setListLoading(true);
    setListType(type);
    setListUsers([]);
    setProfileError("");

    try {
      const response = await api.get(
        `/users/${encodeURIComponent(selectedProfile.username)}/${type}`
      );

      const users = response.data.users || [];
      setListUsers(users);
    } catch (err) {
      setProfileError(
        err.response?.data?.message ||
          `Could not load ${type} list.`
      );
    } finally {
      setListLoading(false);
    }
  }

  async function handleFollowToggle() {
    if (!selectedProfile?._id || followLoading) return;

    setFollowLoading(true);
    setProfileError("");

    try {
      await api.post(`/users/${selectedProfile._id}/follow`);

      const [profileResponse, meResponse] = await Promise.all([
        api.get(`/users/${encodeURIComponent(selectedProfile.username)}`),
        api.get("/users/me"),
      ]);

      setSelectedProfile(
        profileResponse.data.user || profileResponse.data
      );
      setCurrentUser(meResponse.data.user || meResponse.data);

      setNotice("Follow status updated successfully.");
    } catch (err) {
      setProfileError(
        err.response?.data?.message ||
          "Could not update follow status. Please try again."
      );
    } finally {
      setFollowLoading(false);
    }
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

  const myId = getId(currentUser?._id || currentUser?.id);

  const visiblePosts = posts.filter((post) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    const author =
      post.author && typeof post.author === "object"
        ? `${post.author.name || ""} ${post.author.username || ""}`
        : "";

    return `${post.content || ""} ${author}`
      .toLowerCase()
      .includes(query);
  });

  const profileFollowers = selectedProfile?.followers || [];
  const profileFollowing = selectedProfile?.following || [];

  const isOwnProfile =
    myId &&
    getId(selectedProfile?._id || selectedProfile?.id) === myId;

  const isFollowing =
    !isOwnProfile &&
    profileFollowers.some((follower) => getId(follower) === myId);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={() => {
            closeProfile();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{
            ...styles.logo,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
          }}
          title="Go to Connectify home"
        >
          <Users size={29} />
          <span>Connectify</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {currentUser?.username && (
            <button
              type="button"
              style={styles.secondary}
              onClick={() => openProfile(currentUser.username)}
            >
              <UserRound size={17} />
              My Profile
            </button>
          )}

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

              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>
                  {currentUser.name ||
                    currentUser.username ||
                    "Connectify User"}
                </strong>
                <p style={{ ...styles.muted, margin: "4px 0 0" }}>
                  {currentUser.username
                    ? `@${currentUser.username}`
                    : currentUser.email || "Welcome to Connectify"}
                </p>
              </div>

              <button
                type="button"
                style={styles.secondary}
                onClick={() => openProfile(currentUser.username)}
              >
                View Profile
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: 22,
                marginTop: 18,
                paddingTop: 15,
                borderTop: "1px solid #f0edf6",
              }}
            >
              <button
                type="button"
                onClick={() => openProfile(currentUser.username)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#514568",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                }}
              >
                <strong>{profileFollowersCount(currentUser)}</strong>
                <span style={styles.muted}> Followers</span>
              </button>

              <button
                type="button"
                onClick={() => openProfile(currentUser.username)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#514568",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                }}
              >
                <strong>{profileFollowingCount(currentUser)}</strong>
                <span style={styles.muted}> Following</span>
              </button>
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
          <section
            style={{ ...styles.card, textAlign: "center", padding: 35 }}
          >
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

          const alreadyLiked = likes.some(
            (like) => myId && getId(like) === myId
          );

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

                <div style={{ minWidth: 0 }}>
                  <button
                    type="button"
                    onClick={() => openProfile(author.username)}
                    disabled={!author.username}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      color: "#272044",
                      fontWeight: 800,
                      cursor: author.username ? "pointer" : "default",
                      textAlign: "left",
                    }}
                  >
                    {author.name || author.username || "Connectify User"}
                  </button>

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

      {/* Profile modal */}
      {(selectedProfile || profileLoading || profileError) && (
        <div
          onClick={closeProfile}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(24, 16, 43, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            overflowY: "auto",
          }}
        >
          <section
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(500px, 100%)",
              maxHeight: "85vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: 20,
              padding: 22,
              boxShadow: "0 20px 70px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 21 }}>User Profile</h2>
              <button
                type="button"
                onClick={closeProfile}
                aria-label="Close profile"
                style={styles.secondary}
              >
                <X size={19} />
              </button>
            </div>

            {profileLoading && <p>Loading profile...</p>}

            {profileError && (
              <p role="alert" style={{ color: "#b91c1c" }}>
                {profileError}
              </p>
            )}

            {selectedProfile && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: "#eee6ff",
                      color: "#7138d4",
                      fontSize: 26,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {(selectedProfile.name ||
                      selectedProfile.username ||
                      "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: "0 0 5px", overflowWrap: "anywhere" }}>
                      {selectedProfile.name || selectedProfile.username}
                    </h3>
                    <p style={{ ...styles.muted, margin: 0 }}>
                      @{selectedProfile.username}
                    </p>
                  </div>
                </div>

                {selectedProfile.bio && (
                  <p style={{ lineHeight: 1.6, overflowWrap: "anywhere" }}>
                    {selectedProfile.bio}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    padding: "16px 0",
                    borderTop: "1px solid #eee9f6",
                    borderBottom: "1px solid #eee9f6",
                    marginBottom: 16,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => openUserList("followers")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      color: "#272044",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <strong>{profileFollowersCount(selectedProfile)}</strong>
                    <div style={styles.muted}>Followers</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => openUserList("following")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      color: "#272044",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <strong>{profileFollowingCount(selectedProfile)}</strong>
                    <div style={styles.muted}>Following</div>
                  </button>
                </div>

                {!isOwnProfile && (
                  <button
                    type="button"
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    style={{
                      ...styles.primary,
                      width: "100%",
                      opacity: followLoading ? 0.65 : 1,
                    }}
                  >
                    {isFollowing ? (
                      <UserCheck size={18} />
                    ) : (
                      <UserPlus size={18} />
                    )}
                    {followLoading
                      ? "Please wait..."
                      : isFollowing
                      ? "Unfollow"
                      : "Follow"}
                  </button>
                )}

                {listType && (
                  <div style={{ marginTop: 22 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setListType("");
                          setListUsers([]);
                          setProfileError("");
                        }}
                        style={styles.secondary}
                      >
                        <ArrowLeft size={16} />
                        Back
                      </button>

                      <h3 style={{ margin: 0 }}>
                        {listType === "followers"
                          ? "Followers"
                          : "Following"}
                      </h3>
                    </div>

                    {listLoading && <p>Loading users...</p>}

                    {!listLoading &&
                      listUsers.length === 0 &&
                      !profileError && (
                        <p style={styles.muted}>
                          No users in this list yet.
                        </p>
                      )}

                    {!listLoading &&
                      listUsers.map((user) => (
                        <button
                          type="button"
                          key={user._id}
                          onClick={() => openProfile(user.username)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            width: "100%",
                            padding: "12px 4px",
                            border: "none",
                            borderBottom: "1px solid #f0edf6",
                            background: "#ffffff",
                            cursor: "pointer",
                            textAlign: "left",
                            color: "#272044",
                          }}
                        >
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: "50%",
                              display: "grid",
                              placeItems: "center",
                              background: "#eee6ff",
                              color: "#7138d4",
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {(user.name || user.username || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{user.name || user.username}</strong>
                            <p style={{ ...styles.muted, margin: "4px 0 0" }}>
                              @{user.username}
                            </p>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function profileFollowersCount(user) {
  return Array.isArray(user?.followers) ? user.followers.length : 0;
}

function profileFollowingCount(user) {
  return Array.isArray(user?.following) ? user.following.length : 0;
}

export default App;
