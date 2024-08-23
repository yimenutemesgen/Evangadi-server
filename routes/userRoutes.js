





const express = require("express");
const routes = express.Router();
// User controllers
const {
  register,
  login,
  checkUser,
  resetPassword,
} = require("../controller/useController");
// Authentication middleware
const authMiddleware = require("../middleware/authMiddleware");

// Register user
routes.post("/register", register);

// Login user
routes.post("/login", login);

// Check user authentication (protected route)
routes.get("/check", authMiddleware, checkUser);

// Initiate password reset
routes.post("/password-reset", resetPassword);

module.exports = routes;
