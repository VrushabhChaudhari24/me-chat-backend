import hasMutualFollow from "../utils/mutualFollow.js";
import { getSocketIdsByUserId } from "./onlineUsers.js";

const callSocket = (io, socket) => {
  socket.on("call-user", async ({ receiverId, callType }) => {
    const allowed = await hasMutualFollow(socket.userId, receiverId);
    if (!allowed) return;

    getSocketIdsByUserId(receiverId).forEach((sid) => {
      io.to(sid).emit("incoming-call", {
        callerId: socket.userId,
        callType,
      });
    });
  });

  socket.on("accept-call", ({ callerId }) => {
    if (!callerId) return;

    const callerSockets = getSocketIdsByUserId(callerId);

    callerSockets.forEach((socketId) => {
      io.to(socketId).emit("call-accepted", {
        receiverId: socket.userId,
      });
    });
  });

  socket.on("reject-call", ({ callerId }) => {
    getSocketIdsByUserId(callerId).forEach((sid) => {
      io.to(sid).emit("call-rejected", {
        receiverId: socket.userId,
      });
    });
  });

  socket.on("offer", ({ receiverId, offer }) => {
    getSocketIdsByUserId(receiverId).forEach((sid) => {
      io.to(sid).emit("offer", {
        senderId: socket.userId,
        offer,
      });
    });
  });

  socket.on("answer", ({ receiverId, answer }) => {
    getSocketIdsByUserId(receiverId).forEach((sid) => {
      io.to(sid).emit("answer", {
        senderId: socket.userId,
        answer,
      });
    });
  });

  socket.on("ice-candidate", ({ receiverId, candidate }) => {
    getSocketIdsByUserId(receiverId).forEach((sid) => {
      io.to(sid).emit("ice-candidate", {
        senderId: socket.userId,
        candidate,
      });
    });
  });

  socket.on("end-call", ({ receiverId }) => {
    getSocketIdsByUserId(receiverId).forEach((sid) => {
      io.to(sid).emit("call-ended", {
        senderId: socket.userId,
      });
    });
  });
};

export default callSocket;
