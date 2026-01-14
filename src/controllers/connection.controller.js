import Chat from "../models/Chat.js";
import ConnectionRequest from "../models/ConnectionRequest.js";
import { getSocketIdsByUserId } from "../socket/onlineUsers.js";
import findOrCreateChat from "../utils/findOrCreateChat.js";

/**
 * SEND CONNECTION REQUEST
 * POST /api/connections/request/:userId
 */
export const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.userId;
    const io = req.app.get("io");

    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ message: "You cannot connect with yourself" });
    }

    const existing = await ConnectionRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    }).lean();

    if (existing) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const reverse = await ConnectionRequest.findOne({
      sender: receiverId,
      receiver: senderId,
      status: "pending",
    }).lean();

    if (reverse) {
      return res.status(400).json({
        message: "User has already sent you a request",
      });
    }

    const request = await ConnectionRequest.create({
      sender: senderId,
      receiver: receiverId,
    });

    const receiverSockets = getSocketIdsByUserId(receiverId);
    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit("connection:request", {
        requestId: request._id,
        senderId,
      });
    });

    res.status(201).json({
      message: "Connection request sent",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send connection request",
    });
  }
};

/**
 * ACCEPT CONNECTION REQUEST
 * POST /api/connections/accept/:requestId
 */
export const acceptConnectionRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { requestId } = req.params;
    const io = req.app.get("io");

    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Connection request not found",
      });
    }

    if (request.receiver.toString() !== userId) {
      return res.status(403).json({
        message: "Not authorized to accept this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Request already processed",
      });
    }

    if (request.receiver.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    request.status = "accepted";
    await request.save();

    const senderId = request.sender.toString();
    const receiverId = request.receiver.toString();

    // 🔥 Notify sender
    getSocketIdsByUserId(senderId).forEach((id) =>
      io.to(id).emit("connection:accepted", {
        userId: receiverId,
      })
    );

    res.json({
      message: "Connection request accepted"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to accept request",
    });
  }
};

/**
 * REJECT CONNECTION REQUEST
 * POST /api/connections/reject/:requestId
 */
export const rejectConnectionRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { requestId } = req.params;
    const io = req.app.get("io");

    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Connection request not found",
      });
    }

    if (request.receiver.toString() !== userId) {
      return res.status(403).json({
        message: "Not authorized to reject this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Request already processed",
      });
    }

    request.status = "rejected";
    await request.save();

    getSocketIdsByUserId(request.sender.toString()).forEach((id) =>
      io.to(id).emit("connection:rejected", {
        userId: request.receiver.toString(),
      })
    );

    res.json({
      message: "Connection request rejected",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject request",
    });
  }
};

/**
 * GET SENT REQUESTS
 * GET /api/connections/sent
 */
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await ConnectionRequest.find({
      sender: userId,
    })
      .populate("receiver", "name mobile")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sent requests",
    });
  }
};

/**
 * GET RECEIVED REQUESTS
 * GET /api/connections/received
 */
export const getReceivedRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await ConnectionRequest.find({
      receiver: userId,
      status: "pending",
    })
      .populate("sender", "name mobile")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch received requests",
    });
  }
};

/**
 * GET MUTUAL CONNECTIONS
 * GET /api/connections/mutual
 */
export const getMutualConnections = async (req, res) => {
  try {
    const userId = req.userId;

    const connections = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ sender: userId }, { receiver: userId }],
    }).populate("sender receiver", "name mobile").lean();
    
    // Users I follow
    const following = new Map();

    // Users who follow me
    const followers = new Map();

    connections.forEach(conn => {
      const senderId = conn.sender._id.toString();
      const receiverId = conn.receiver._id.toString();

      if (senderId === userId) {
        following.set(receiverId, conn.receiver);
      }

      if (receiverId === userId) {
        followers.set(senderId, conn.sender);
      }
    });

    
    // Mutual connections
    const mutualConnections = [];

    following.forEach((user, id) => {
      if (followers.has(id)) {
        mutualConnections.push({
          ...user,
          isMutual: true
        });
      }
    });

    const chats = await Chat.find({
          participants: userId,
        })
    const filteredMutualConnections = mutualConnections.filter((mutual) => {
  return !chats.some((chat) => {
    return (
      chat.participants.includes(userId) &&
      chat.participants.includes(mutual._id)
    );
  });
});

    res.json(filteredMutualConnections);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch connections",
    });
  }
};
