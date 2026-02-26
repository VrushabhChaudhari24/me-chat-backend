import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getSentRequests,
  getReceivedRequests,
  getMutualConnections,
  getConnection,
  acceptAndChatConnectionRequest,
} from "../controllers/connection.controller.js";

const router = express.Router();

router.post("/request/:userId", authMiddleware, sendConnectionRequest);
router.post("/accept/:requestId", authMiddleware, acceptConnectionRequest);
router.post("/reject/:requestId", authMiddleware, rejectConnectionRequest);

router.get("/sent", authMiddleware, getSentRequests);
router.get("/received", authMiddleware, getReceivedRequests);
router.get("/mutual", authMiddleware, getMutualConnections);

//V2
router.get("/connection", authMiddleware, getConnection);
router.post("/accept-chat/:requestId", authMiddleware, acceptAndChatConnectionRequest);

export default router;
