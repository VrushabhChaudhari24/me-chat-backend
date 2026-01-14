import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { searchUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/search", authMiddleware, searchUsers);

export default router;
