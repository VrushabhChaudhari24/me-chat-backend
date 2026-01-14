import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import followRoutes from "./routes/follow.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import userRoutes from "./routes/user.routes.js";
import connectionRoutes from "./routes/connection.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", (req, res) => {
  res.status(200).send("API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api", followRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/connections", connectionRoutes);

export default app;
