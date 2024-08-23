

const dbConnection = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");

// Post new question
async function postNewQuestion(req, res) {
  const { title, description, tag } = req.body;
  const { userid } = req.user;

  if (!title || !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide all required fields",
    });
  }

  try {
    // Check if a question with the same title and description already exists
    const [existingQuestions] = await dbConnection.query(
      "SELECT title, description FROM questionTable WHERE title = ? AND description = ?",
      [title, description]
    );

    if (existingQuestions.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({
        error: "Conflict",
        message: "A question with the same title and description already exists.",
      });
    }

    // Generate a unique questionid
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000);
    const questionid = `${timestamp}-${randomId}`;

    // Insert the new question into the database
    await dbConnection.query(
      "INSERT INTO questionTable (questionid, userid, title, description, tag) VALUES (?, ?, ?, ?, ?)",
      [questionid, userid, title, description, tag]
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Question created successfully",
      questionid: questionid,
    });
  } catch (error) {
    console.error("Error creating question:", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

// Fetch all questions
async function fetchQuestion(req, res) {
  try {
    const [questions] = await dbConnection.query(
      `SELECT 
         questionTable.questionid AS question_id, 
         questionTable.title, 
         questionTable.description AS content, 
         userTable.username AS user_name, 
         questionTable.created_at 
       FROM questionTable 
       JOIN userTable ON questionTable.userid = userTable.userid 
       ORDER BY questionTable.created_at DESC`
    );

    if (questions.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "No questions found.",
      });
    }

    return res.status(StatusCodes.OK).json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

// Get a single question
async function getSingleQuestion(req, res) {
  const { question_id } = req.params;
  
  try {
    const [question] = await dbConnection.query(
      "SELECT questionTable.questionid as question_id, questionTable.title, questionTable.description as content, userTable.userid as user_id, questionTable.created_at FROM questionTable JOIN userTable ON questionTable.userid = userTable.userid WHERE questionid = ?",
      [question_id]
    );

    if (question.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "The requested question could not be found.",
      });
    }

    res.status(StatusCodes.OK).json({ question: question[0] });
  } catch (error) {
    console.error("Error retrieving question:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

module.exports = { postNewQuestion, fetchQuestion, getSingleQuestion };
