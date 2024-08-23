

const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Authentication token is missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to the request object
    req.user = { username: decoded.username, userid: decoded.userid };

    // Pass control to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Authentication token is invalid or expired" });
  }
}

module.exports = authMiddleware;
