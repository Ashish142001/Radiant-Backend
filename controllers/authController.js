const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");
const Token = require("../models/Token");
const transporter = require("../config/mailer");
const { validationResult } = require("express-validator");
const { getFromCache, setInCache, deleteFromCache } = require("../utils/cache");

// Helper function to send emails
const sendEmail = async (email, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: text,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// User Registration
exports.register = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    
    // Cache the user data
    await setInCache(`user:${user._id}`, {
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to get user from cache first
    const cachedUser = await getFromCache(`user:email:${email}`);
    let user;

    if (cachedUser) {
      user = cachedUser;
    } else {
      // If not in cache, get from database
      user = await User.findOne({ email });
      if (user) {
        // Cache the user data
        await setInCache(`user:${user._id}`, {
          _id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        });
        await setInCache(`user:email:${email}`, {
          _id: user._id,
          username: user.username,
          email: user.email,
          password: user.password,
          createdAt: user.createdAt
        });
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create session
    req.session.userId = user._id;
    
    res.json({ message: "Logged in successfully" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User Logout
exports.logout = async (req, res) => {
  try {
    // Clear session
    req.session.destroy();
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Initiate Password Reset
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email does not exist" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save token to database
    const token = new Token({
      userId: user.id,
      token: hashedToken,
      expires: Date.now() + 3600000, // 1 hour
    });

    await token.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please make a PUT request to: ${resetUrl}`;

    await sendEmail(user.email, "Password Reset", message);

    res.status(200).json({ msg: "Password reset email sent" });
  } catch (error) {
    console.error("Error during password reset initiation:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find token in database
    const passwordResetToken = await Token.findOne({
      token: hashedToken,
      expires: { $gt: Date.now() },
    });

    if (!passwordResetToken) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // Find user
    const user = await User.findById(passwordResetToken.userId);
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Delete token
    await passwordResetToken.deleteOne();

    res.status(200).json({ msg: "Password reset successful" });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
