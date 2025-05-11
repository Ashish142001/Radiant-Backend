const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");

// User Registration Route
router.post(
  "/register",
  [
    body("username", "Username is required").notEmpty(),
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  authController.register
);

// User Login Route
router.post(
  "/login",
  [
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password is required").exists(),
  ],
  authController.login
);

// User Logout Route
router.post("/logout", authController.logout);

// Forgot Password Route
router.post(
  "/forgot-password",
  [body("email", "Please include a valid email").isEmail()],
  authController.forgotPassword
);

// Reset Password Route
router.put(
  "/reset-password/:token",
  [
    body("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  authController.resetPassword
);

module.exports = router;
