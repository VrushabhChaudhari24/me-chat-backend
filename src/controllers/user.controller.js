import User from "../models/User.js";

/**
 * GET /api/users/search?q=
 */
export const searchUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        message: "Search query must be at least 2 characters",
      });
    }

    const isNumber = /^[0-9]+$/.test(q);

    const query = {
      _id: { $ne: userId }, // exclude self
      ...(isNumber
        ? { mobile: { $regex: q, $options: "i" } }
        : { name: { $regex: q, $options: "i" } }),
    };

    const users = await User.find(query)
      .select("_id name mobile")
      .limit(20);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
};
