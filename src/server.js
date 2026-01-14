import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { Server } from "socket.io";
import socketAuth from "./socket/auth.socket.js";
import chatSocket from "./socket/chat.socket.js";
import callSocket from "./socket/call.socket.js";

dotenv.config();
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

io.use(socketAuth);

// Export io for controllers
export { io };

io.on("connection", (socket) => {
  chatSocket(io, socket);
  callSocket(io, socket);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
