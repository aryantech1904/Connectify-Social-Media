
const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET LOGGED-IN USER PROFILE
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name username email bio profilePicture followers following createdAt"
    );

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Profile Error:", error.message);
    return res.status(500).json({ message: "Unable to fetch profile." });
  }
});

// GET USER PROFILE BY USERNAME
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username.toLowerCase(),
    })
      .select("name username bio profilePicture followers following createdAt")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("User Profile Error:", error.message);
    return res.status(500).json({ message: "Unable to fetch user profile." });
  }
});

// UPDATE OWN PROFILE
router.patch("/me", protect, async (req, res) => {
  try {
    const allowedFields = ["name", "bio", "profilePicture"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            message: `${field} must be a string.`,
          });
        }

        updates[field] = req.body[field].trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid profile fields provided." });
    }

    if (updates.name !== undefined && !updates.name) {
      return res.status(400).json({ message: "Name cannot be empty." });
    }

    if (updates.name && updates.name.length > 100) {
      return res.status(400).json({ message: "Name is too long." });
    }

    if (updates.bio && updates.bio.length > 250) {
      return res.status(400).json({ message: "Bio cannot exceed 250 characters." });
    }

    if (updates.profilePicture && updates.profilePicture.length > 2048) {
      return res.status(400).json({ message: "Profile picture URL is too long." });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("name username email bio profilePicture followers following");

    return res.status(200).json({
      message: "Profile updated successfully!",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    return res.status(500).json({ message: "Unable to update profile." });
  }
});

// FOLLOW / UNFOLLOW USER
router.post("/:id/follow", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const alreadyFollowing = targetUser.followers.some(
      (followerId) => followerId.toString() === req.user._id.toString()
    );

    if (alreadyFollowing) {
      await User.updateOne(
        { _id: targetUser._id },
        { $pull: { followers: req.user._id } }
      );

      await User.updateOne(
        { _id: req.user._id },
        { $pull: { following: targetUser._id } }
      );
    } else {
      await User.updateOne(
        { _id: targetUser._id },
        { $addToSet: { followers: req.user._id } }
      );

      await User.updateOne(
        { _id: req.user._id },
        { $addToSet: { following: targetUser._id } }
      );
    }

    const updatedUser = await User.findById(targetUser._id).select(
      "name username followers following"
    );

    return res.status(200).json({
      message: alreadyFollowing ? "User unfollowed." : "User followed!",
      following: !alreadyFollowing,
      followersCount: updatedUser.followers.length,
    });
  } catch (error) {
    console.error("Follow User Error:", error.message);
    return res.status(500).json({ message: "Unable to follow/unfollow user." });
  }
});

module.exports = router;
