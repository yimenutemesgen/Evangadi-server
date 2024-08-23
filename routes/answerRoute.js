






const express = require("express");
const route = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { postAnswer, fetchAnswer } = require("../controller/answerControll");

// API endpoint to post an answer (protected by authMiddleware)
route.post("/", authMiddleware, postAnswer);

// API endpoint to fetch all answers for a specific question
route.get("/:question_id", fetchAnswer);

module.exports = route;
