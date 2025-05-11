const redis = require("redis");

// Create Redis client using URL
const client = redis.createClient({ url: process.env.REDIS_URL });

// Handle errors
client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

// Connect asynchronously
(async () => {
  try {
    await client.connect();
    console.log("Connected to Redis successfully!");
  } catch (error) {
    console.error("Could not connect to Redis:", error);
  }
})();

module.exports = client;
