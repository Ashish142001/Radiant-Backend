const { body } = require("express-validator");

exports.registerValidation = [
  body("username").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
];

exports.loginValidation = [
  body("username").notEmpty(),
  body("password").notEmpty(),
];
