import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, city } = req.body;

    // 1️⃣ Basic validation
    if (!name || !username || !email || !password || !city) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Check existing user
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // 3️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4️⃣ Create user
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      city,
    });

    // 5️⃣ Generate token
    const token = generateToken(user._id);

    // 6️⃣ Send response
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        city: user.city,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



// LOGIN USER (SECURE VERSION)

export const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // 4️⃣ Generate JWT
    const token = generateToken(user._id);

    // 5️⃣ Set HTTP-Only Cookie
    res.cookie("token", token, {
      httpOnly: true, // 🔥 prevents JS access (XSS safe)
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "Strict", // CSRF protection
      maxAge: rememberMe
        ? 7 * 24 * 60 * 60 * 1000 // 7 days
        : undefined, // session cookie
    });

    // 6️⃣ Send response (NO TOKEN RETURNED)
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET CURRENT LOGGED-IN USER
export const getMe = async (req, res) => {
  try {
    // protect middleware already attaches user to req
    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      username: req.user.username,
      city: req.user.city,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// LOGOUT USER
export const logoutUser = (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0), // immediately expire
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};