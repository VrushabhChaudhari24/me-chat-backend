const onlineUsers = new Map(); 
// userId => Set(socketId)

export const addUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socketId);
};

export const removeUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) return;

  const sockets = onlineUsers.get(userId);
  sockets.delete(socketId);

  if (sockets.size === 0) {
    onlineUsers.delete(userId);
  }
};

export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

export const getSocketIdsByUserId = (userId) => {
  return onlineUsers.get(userId) || new Set();
};

export const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};
