
const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/Post");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE POST
router.post("/", protect, async (req, res) => {
  try {
    const { content } = req.body;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: "Post content cannot be empty." });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({ message: "Post cannot exceed 2000 characters." });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
    });

    await post.populate("author", "name username profilePicture");

    return res.status(201).json({
      message: "Post created successfully!",
      post,
    });
  } catch (error) {
    console.error("Create Post Error:", error.message);
    return res.status(500).json({ message: "Server error while creating post." });
  }
});

// GET ALL POSTS
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name username profilePicture")
      .populate("comments.user", "name username profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Fetch Posts Error:", error.message);
    return res.status(500).json({ message: "Server error while fetching posts." });
  }
});

// LIKE / UNLIKE POST
router.post("/:id/like", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID." });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const userId = req.user._id;
    const alreadyLiked = post.likes.some(
      (like) => like.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.addToSet(userId);
    }

    await post.save();

    return res.status(200).json({
      message: alreadyLiked ? "Post unliked." : "Post liked!",
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("Like Post Error:", error.message);
    return res.status(500).json({ message: "Server error while liking post." });
  }
});

// ADD COMMENT
router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID." });
    }

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty." });
    }

    if (text.trim().length > 1000) {
      return res.status(400).json({ message: "Comment cannot exceed 1000 characters." });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim(),
    });

    await post.save();
    await post.populate("comments.user", "name username profilePicture");

    return res.status(201).json({
      message: "Comment added successfully!",
      comments: post.comments,
    });
  } catch (error) {
    console.error("Add Comment Error:", error.message);
    return res.status(500).json({ message: "Server error while adding comment." });
  }
});

module.exports = router;
