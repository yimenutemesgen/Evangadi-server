



require("dotenv").config();
const jwt = require('jsonwebtoken');
const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;
const authMiddleware = require("./middleware/authMiddleware");

// DB connection
const dbconnection = require("./db/dbConfig");
app.use(cors());

// Route middleware for creating tables
const createTablesRoute = require("./db/create-Tables");
app.use("/install", createTablesRoute);

// User routes middleware
const userRoutes = require("./routes/userRoutes");
app.use(express.json());
app.use("/api/user", userRoutes);

// Example: Generating a JWT token when a user signs up or logs in
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Assume user authentication is done here
  const user = { id: 1, username: username }; // Example user

  // Sign a token with the user's id and username
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Question routes middleware
const questionRoutes = require("./routes/questionRoutes");
app.use("/api/question", authMiddleware, questionRoutes);

// Answer routes middleware
const answerRoutes = require("./routes/answerRoute");
app.use("/api/answer", authMiddleware, answerRoutes);

async function start() {
  try {
    const result = await dbconnection.execute("select'test'");
    await app.listen(port);
    console.log(result);
    console.log(`Listening on port ${port}`);
  } catch (error) {
    console.log(error.message);
  }
}

start();
