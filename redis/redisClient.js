const { createClient } = require("redis");

const client = createClient();

client.on("error", (error) => {
  console.error(`Redis client error:`, error);
});

const connectRedis = () => {
  client.connect().then(() => {
    console.log("Redis connected!");
  });
};

module.exports = {
  client,
  connectRedis,
};
