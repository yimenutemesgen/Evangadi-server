



const dbConnection = require("../db/dbConfig.js");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

//User Register
 
async function register(req, res) {
  const { username, first_name, last_name, email, password } = req.body;

  if (!username || !first_name || !last_name || !email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please provide all required fields",
    });
  }

  try {
    const [existingUser] = await dbConnection.query(
      "SELECT username, email FROM userTable WHERE username=? OR email=?",
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: "User already exists" 
      });
    }

    if (password.length < 8) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Password must be at least 8 characters",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await dbConnection.query(
      "INSERT INTO userTable (username, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)",
      [username, first_name, last_name, email, hashedPassword]
    );

    return res.status(StatusCodes.CREATED).json({ 
      message: "User registered successfully" 
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "An unexpected error occurred.",
    });
  }
}

//Login User
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please provide all required fields",
    });
  }

  try {
    const [user] = await dbConnection.query(
      "SELECT username, userid, password FROM userTable WHERE email=?",
      [email]
    );

    if (user.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ username: user[0].username, userid: user[0].userid }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(StatusCodes.OK).json({ 
      message: "User logged in successfully", 
      token, 
      username: user[0].username 
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "An unexpected error occurred.",
    });
  }
}

//Check User Authentication
async function checkUser(req, res) {
  try {
    const { username, userid } = req.user;
    return res.status(StatusCodes.OK).json({ 
      message: "Valid user", 
      username, 
      userid 
    });
  } catch (error) {
    console.error("Authentication check error:", error.message);
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authentication invalid",
    });
  }
}

// reset password
async function resetPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please provide an email address",
    });
  }

  try {
    const [user] = await dbConnection.query(
      "SELECT userid, username FROM userTable WHERE email=?",
      [email]
    );

    if (user.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "No account found with this email",
      });
    }

    const { userid, username } = user[0];
    const token = jwt.sign({ username, userid }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const expiration = Date.now() + 3600000; // 1 hour

    await dbConnection.query(
      "UPDATE userTable SET resetToken=?, resetTokenExpiry=? WHERE email=?",
      [token, expiration, email]
    );

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD,
      },
      logger: true, // Enable logging
      debug: true,  // Enable debug mode
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await transporter.sendMail({
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. The link will expire in 1 hour.</p>`,
    });

    return res.status(StatusCodes.OK).json({
      message: "Password reset instructions sent to your email",
    });
  } catch (error) {
    console.error("Password reset error:", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong, try again later!",
    });
  }
}

module.exports = { register, login, checkUser, resetPassword };
