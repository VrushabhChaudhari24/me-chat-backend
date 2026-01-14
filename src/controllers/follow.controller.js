import User from "../models/User.js";

export const followUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { targetId } = req.params;

    if (!currentUserId || !targetId) {
      return res.status(400).json({ message: "Invalid or missing user id(s)" });
    }

    if (currentUserId === targetId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetId),
    ]);
    
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure arrays exist
    currentUser.following = Array.isArray(currentUser.following)
      ? currentUser.following
      : [];
    targetUser.followers = Array.isArray(targetUser.followers)
      ? targetUser.followers
      : [];

    // Already following?
    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetId.toString()
    );
    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add relationship
    currentUser.following.push(targetId);
    targetUser.followers.push(currentUserId);

    await Promise.all([currentUser.save(), targetUser.save()]);

    return res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { targetId } = req.params;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetId);

    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    currentUser.following = (currentUser.following || []).filter(
      (id) => id.toString() !== targetId.toString()
    );

    targetUser.followers = (targetUser.followers || []).filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    await Promise.all([currentUser.save(), targetUser.save()]);

    return res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get follow status
 */
export const getFollowStatus = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { targetId } = req.params;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) return res.status(404).json({ message: "Current user not found" });

    const following = (currentUser.following || []).some(
      (id) => id.toString() === targetId.toString()
    );
    const follower = (currentUser.followers || []).some(
      (id) => id.toString() === targetId.toString()
    );

    return res.json({ isFollowing: following, isFollower: follower, isMutual: following && follower });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMutaualList = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) return res.status(404).json({ message: "Current user not found" });
    const mutuals = (currentUser.following || []).filter((id) =>
      (currentUser.followers || []).some(
        (followerId) => followerId.toString() === id.toString()
      )
    );
    return res.json(mutuals);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};