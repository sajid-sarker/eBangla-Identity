import Citizen from "../models/Citizen.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper feature to generate token and set cookie
const generateTokenAndSetCookie = (res, citizenId) => {
  const token = jwt.sign({ id: citizenId }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d",
  });

  // Set JWT as httpOnly cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  
  return token;
};

// @desc    Register a new citizen
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  console.log("Registering user:", req.body.email);
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }

    // Check if citizen exists
    const citizenExists = await Citizen.findOne({ email });

    if (citizenExists) {
      return res.status(400).json({ message: "Citizen already exists with that email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create citizen
    const citizen = await Citizen.create({
      name,
      email,
      password: hashedPassword,
    });

    if (citizen) {
      generateTokenAndSetCookie(res, citizen._id);
      
      res.status(201).json({
        _id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        message: "Registration successful",
      });
    } else {
      res.status(400).json({ message: "Invalid citizen data" });
    }
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Authenticate a citizen
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Check for user email
    const citizen = await Citizen.findOne({ email });

    if (citizen && (await bcrypt.compare(password, citizen.password))) {
      generateTokenAndSetCookie(res, citizen._id);

      res.status(200).json({
        _id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        message: "Login successful",
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Logout citizen / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const citizen = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    };
    res.status(200).json(citizen);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
