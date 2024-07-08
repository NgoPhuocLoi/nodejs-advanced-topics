const { client } = require("../redis/redisClient");

const caching = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const value = await client.get(userId);
    if (value) {
      req.cachedBlogs = value;
    }
    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  caching,
};
