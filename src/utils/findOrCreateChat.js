import Chat from "../models/Chat.js";

const findOrCreateChat = async (userA, userB) => {
  const participants = [userA, userB].sort();

  let chat = await Chat.findOne({
    participants,
  });

  if (!chat) {
    chat = await Chat.create({ participants });
  }

  return chat;
};

export default findOrCreateChat;
