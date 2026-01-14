import User from "../models/User.js";

const hasMutualFollow = async (userAId, userBId) => {
  const userA = await User.findById(userAId);

  return (
    userA.following.includes(userBId) &&
    userA.followers.includes(userBId)
  );
};

export default hasMutualFollow;
