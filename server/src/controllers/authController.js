import { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } from "../config/env.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import Citizen from "../models/Citizen.js";
import Admin from "../models/Admin.js";

const generateTokenAndSetCookie = (res, userId, role = "citizen") => {
  const token = jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  const maxAge = parseInt(JWT_EXPIRES_IN) * 60 * 1000;
  // Set JWT as httpOnly cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: NODE_ENV !== "development", // Set to true in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: maxAge,
  });
  return token;
};

// AUTH LOGIC
export const register = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const citizenExists = await Citizen.findOne({ email });
    if (citizenExists)
      return res.status(400).json({ message: "Citizen already exists" });

    if (citizenExists) {
      return res
        .status(409)
        .json({ message: "Citizen already exists with that email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create citizen
    const citizen = await Citizen.create(
      [
        {
          name,
          email,
          password: hashedPassword,
        },
      ],
      { session },
    );

    if (citizen) {
      const token = generateTokenAndSetCookie(res, citizen[0]._id, "citizen");

      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
          token: token,
          user: citizen[0],
        },
      });
    }
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error in registration:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    let user = await Citizen.findOne({ email });
    let isAdmin = false;

    if (!user) {
      user = await Admin.findOne({ email });
      if (user) {
        isAdmin = true;
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const token = generateTokenAndSetCookie(
        res,
        user._id,
        isAdmin ? "admin" : "citizen",
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            ...user.toObject(),
            isAdmin,
          },
        },
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const logout = (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out" });
};
