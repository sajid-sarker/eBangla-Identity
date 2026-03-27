import { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } from "../config/env.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { updateTaxRecord } from "./taxController.js";
import Citizen from "../models/Citizen.js";
import TaxRecord from "../models/TaxRecord.js";

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

// AUTH LOGIC
export const register = async (req, res) => {
  console.log("Registering user:", req.body.email);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const citizenExists = await Citizen.findOne({ email });
    if (citizenExists) return res.status(400).json({ message: "Citizen already exists" });

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

export const logout = (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out" });
};


export const updateProfile = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.user._id);
    if (!citizen) return res.status(404).json({ message: "Citizen not found" });

    
    citizen.name = req.body.name || citizen.name;
    citizen.nid = req.body.nid || citizen.nid;
    citizen.dateOfBirth = req.body.dateOfBirth || citizen.dateOfBirth;
    citizen.gender = req.body.gender || citizen.gender;
    citizen.phone = req.body.phone || citizen.phone;
    citizen.maritalStatus = req.body.maritalStatus || citizen.maritalStatus;

    if (req.body.address) {
      citizen.address = {
        division: req.body.address.division || citizen.address?.division,
        district: req.body.address.district || citizen.address?.district,
        upazilla: req.body.address.upazilla || citizen.address?.upazilla,
        village: req.body.address.village || citizen.address?.village,
      };
    }

    if (req.body.yearlyIncome !== undefined) {
      citizen.yearlyIncome = Number(req.body.yearlyIncome);
    
      await updateTaxRecord(citizen._id, citizen.yearlyIncome);
    }

     
    const isComplete = !!(
      citizen.name &&
      citizen.nid &&
      citizen.dateOfBirth &&
      citizen.gender &&
      citizen.phone &&
      citizen.maritalStatus &&
      citizen.address?.division &&
      citizen.address?.district &&
      citizen.address?.upazilla &&
      citizen.address?.village
    );

    citizen.isProfileComplete = isComplete;

    const updatedCitizen = await citizen.save();

    
    res.status(200).json({
      _id: updatedCitizen._id,
      name: updatedCitizen.name,
      email: updatedCitizen.email,
      nid: updatedCitizen.nid,
      dateOfBirth: updatedCitizen.dateOfBirth,
      gender: updatedCitizen.gender,
      phone: updatedCitizen.phone,
      maritalStatus: updatedCitizen.maritalStatus,
      yearlyIncome: updatedCitizen.yearlyIncome,
      address: updatedCitizen.address,
      isProfileComplete: updatedCitizen.isProfileComplete,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};