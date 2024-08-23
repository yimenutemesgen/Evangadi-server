




const express = require("express");
const route = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  postNewQuestion,
  fetchQuestion,
  getSingleQuestion,
} = require("../controller/questionControll");

// API endpoint to fetch all questions
route.get("/", fetchQuestion);

// API endpoint to retrieve details of a specific question
route.get("/:question_id", getSingleQuestion);

// API endpoint to post a new question (protected by authMiddleware)
route.post("/", authMiddleware, postNewQuestion);

module.exports = route;
