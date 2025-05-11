require("dotenv").config();
const express = require("express");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const client = require("./config/redis");
const redisMiddleware = require("./middleware/redisMiddleware");
const authRoutes = require("./routes/authRoutes"); // Import routes

const app = express();
const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

// Middlewares
app.use(express.json()); // Important for parsing JSON!
app.use(redisMiddleware);
app.use(
  session({
    store: new RedisStore({ client }),
    secret: SESSION_SECRET || "default-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  })
);

// Routes
app.use("/api/auth", authRoutes);

// Test Route (Optional)
app.get("/", (req, res) => {
  if (req.session.views) {
    req.session.views++;
  } else {
    req.session.views = 1;
  }
  res.send(`Number of views: ${req.session.views}`);
});

// Initialize MongoDB and Redis
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB(MONGO_URI);
    console.log('MongoDB Connected Successfully');

    // Redis client is already being connected in redis.js

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
