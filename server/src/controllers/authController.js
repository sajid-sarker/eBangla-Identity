import { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } from "../config/env.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Citizen from "../models/Citizen.js";
import TaxRecord from "../models/TaxRecord.js";

// Helper feature to generate token and set cookie
const generateTokenAndSetCookie = (res, citizenId) => {
  const token = jwt.sign({ id: citizenId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  // Set JWT as httpOnly cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: NODE_ENV !== "development", // Set to true in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: JWT_EXPIRES_IN,
  });

  return token;
};

// @desc    Register a new citizen
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  console.log("Registering user:", req.body.email);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and password" });
    }

    // Check if citizen exists
    const citizenExists = await Citizen.findOne({ email });

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
      const token = generateTokenAndSetCookie(res, citizen._id);

      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
          token: token,
          user: citizen,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid citizen data" });
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

// @desc    Authenticate a citizen
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Check for user email
    const citizen = await Citizen.findOne({ email });

    if (!citizen) {
      return res.status(404).json({ message: "Citizen not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, citizen.password);

    if (isPasswordValid) {
      const token = generateTokenAndSetCookie(res, citizen._id);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          token,
          citizen,
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

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.user._id);

    if (citizen) {
      citizen.name = req.body.name || citizen.name;
      citizen.nid = req.body.nid || citizen.nid;
      citizen.dateOfBirth = req.body.dateOfBirth || citizen.dateOfBirth;
      citizen.gender = req.body.gender || citizen.gender;
      citizen.phone = req.body.phone || citizen.phone;
      citizen.maritalStatus = req.body.maritalStatus || citizen.maritalStatus;
      citizen.passport = req.body.passport || citizen.passport;
      citizen.driving_license =
        req.body.driving_license || citizen.driving_license;

      if (req.body.address) {
        citizen.address = {
          division: req.body.address.division || citizen.address?.division,
          district: req.body.address.district || citizen.address?.district,
          upazilla: req.body.address.upazilla || citizen.address?.upazilla,
          village: req.body.address.village || citizen.address?.village,
        };
      }

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        citizen.password = await bcrypt.hash(req.body.password, salt);
      }

      if (req.body.yearlyIncome !== undefined) {
        const income = Number(req.body.yearlyIncome);
        citizen.yearlyIncome = income;

        // SYNC CALCULATION: 0% up to 350,000 | 5% above
        const freeLimit = 350000;
        const tax = income > freeLimit ? (income - freeLimit) * 0.05 : 0;

        // Update or create Tax Record for 2026 automatically
        await TaxRecord.findOneAndUpdate(
          { user: citizen._id, fiscalYear: "2026" },
          { totalIncome: income, taxAmount: tax, status: "Paid" },
          { upsert: true },
        );
      }

      const updatedCitizen = await citizen.save();

      res.status(200).json({
        citizen,
        isProfileComplete: updatedCitizen.isProfileComplete,
        message: "Profile updated successfully",
      });
    } else {
      res.status(404).json({ message: "Citizen not found" });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};