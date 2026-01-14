import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  followUser,
  unfollowUser,
  getFollowStatus,
  getMutaualList,
} from "../controllers/follow.controller.js";

const router = express.Router();

router.post("/follow/:targetId", authMiddleware, followUser);
router.post("/unfollow/:targetId", authMiddleware, unfollowUser);
router.get("/status/:targetId", authMiddleware, getFollowStatus);
router.get("/mutual-list", authMiddleware, getMutaualList);

export default router;
