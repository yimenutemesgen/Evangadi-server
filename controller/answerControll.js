

const dbConnection = require("../db/dbConfig.js");
const { StatusCodes } = require("http-status-codes");

// POST ANSWER
async function postAnswer(req, res) {
  const { answer, questionid } = req.body;
  const { userid } = req.user;

  if (!answer || !questionid) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide answer and question ID.",
    });
  }

  try {
    const [answerResponse] = await dbConnection.query(
      "INSERT INTO answerTable (answer, userid, questionid) VALUES (?,?,?)",
      [answer, userid, questionid]
    );
    const answerid = answerResponse.insertId;

    return res.status(StatusCodes.CREATED).json({
      message: "Answer posted successfully",
      answerid: answerid,
    });
  } catch (error) {
    console.error("Error posting answer: ", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

// FETCH ANSWERS
async function fetchAnswer(req, res) {
  const { question_id } = req.params;

  if (!question_id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "The question ID is required.",
    });
  }

  try {
    const [results] = await dbConnection.query(
      "SELECT answerTable.answerid AS answer_id, answerTable.answer AS content, userTable.username AS user_name, answerTable.created_at FROM answerTable JOIN userTable ON answerTable.userid = userTable.userid WHERE questionid = ? ORDER BY answerTable.created_at DESC",
      [question_id]
    );

    if (!results.length) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "No answers found for the given question ID.",
      });
    }

    return res.status(StatusCodes.OK).json({ answers: results });
  } catch (error) {
    console.error("Error fetching answers: ", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

module.exports = { postAnswer, fetchAnswer };
