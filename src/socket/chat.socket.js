import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import hasMutualFollow from "../utils/mutualFollow.js";
import {
  addUser,
  removeUser,
  getOnlineUsers,
} from "./onlineUsers.js";

const chatSocket = (io, socket) => {
  console.log("User connected:", socket.userId);

  const userId = socket.userId;


  // Add user online
  addUser(userId, socket.id);

  io.emit("user-online", { userId });

  // SEND CURRENT ONLINE USERS
  socket.emit("online-users", {
    users: getOnlineUsers(),
  });

  // USER DISCONNECTED
  socket.on("disconnect", () => {
    removeUser(userId, socket.id);

    // Emit offline only if no sockets left
    if (!getOnlineUsers().includes(userId)) {
      io.emit("user-offline", { userId });
    }
  });


  /**
   * Join chat room
   */
  socket.on("join-chat", async (chatId) => {
    socket.join(chatId);
  });

  /**
   * Send message
   */
  socket.on("send-message", async ({ chatId, receiverId, content }) => {
    try {
      // Mutual follow validation
      const allowed = await hasMutualFollow(socket.userId, receiverId);
      if (!allowed) return;

      const chat = await Chat.findById(chatId);
      if (!chat) return;

      // Save message
      const message = await Message.create({
        chat: chatId,
        sender: socket.userId,
        content,
      });

      chat.lastMessage = message._id;
      await chat.save();

      // Emit to room
      io.to(chatId).emit("receive-message", {
        _id: message._id,
        chatId,
        sender: socket.userId,
        content,
        createdAt: message.createdAt,
      });
    } catch (error) {
      console.error("Socket send message error", error);
    }
  });

  /**
   * Disconnect
   */
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
    removeUser(socket.id);
  });

  socket.on("mark-read", async ({ chatId }) => {
  await Message.updateMany(
    {
      chat: chatId,
      readBy: { $ne: socket.userId },
    },
    {
      $addToSet: { readBy: socket.userId },
    }
  );

  socket.to(chatId).emit("messages-read", {
    chatId,
    userId: socket.userId,
  });
});

};

export default chatSocket;
