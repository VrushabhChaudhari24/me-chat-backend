import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getOrCreateChat,
  sendMessage,
  getChatMessages,
  getUserChats,
  markMessagesAsRead,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getUserChats);
router.post("/with/:targetUserId", authMiddleware, getOrCreateChat);
router.get("/:chatId/messages", authMiddleware, getChatMessages);
router.post("/:chatId/message", authMiddleware, sendMessage);
router.post("/:chatId/read", authMiddleware, markMessagesAsRead);

export default router;
