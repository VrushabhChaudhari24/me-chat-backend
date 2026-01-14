import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import hasMutualFollow from "../utils/mutualFollow.js";

/**
 * Create or get existing chat
 */
export const getOrCreateChat = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { targetUserId } = req.params;
      
    // Mutual follow validation
    const allowed = await hasMutualFollow(currentUserId, targetUserId);
  
    if (!allowed) {
      return res.status(403).json({
        message: "Mutual follow required to start chat",
      });
    }

    // Check existing chat
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, targetUserId] },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [currentUserId, targetUserId],
      });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Send a message
 */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { chatId } = req.params;
    const { content } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check sender is participant
    if (!chat.participants.includes(senderId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const message = await Message.create({
      chat: chatId,
      sender: senderId,
      content,
    });

    chat.lastMessage = message._id;
    await chat.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * Get chat messages
 */
export const getChatMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name mobile")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all chats for logged-in user
 * GET /api/chat
 */
export const getUserChats = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await Chat.find({
      participants: userId,
    })
      .populate("participants", "name mobile")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chat: chat._id,
          readBy: { $ne: userId },
          sender: { $ne: userId },
        });

        return {
          ...chat.toObject(),
          unreadCount,
        };
      })
    );

    res.json(chatsWithUnread);
  } catch (error) {
    res.status(500).json({ message: "Failed to load chats" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { chatId } = req.params;

    await Message.updateMany(
      {
        chat: chatId,
        readBy: { $ne: userId },
      },
      {
        $addToSet: { readBy: userId },
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark messages as read",
    });
  }
};