import Citizen from "../models/Citizen.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { updateTaxRecord } from "./taxController.js";

const generateTokenAndSetCookie = (res, citizenId) => {
  const token = jwt.sign({ id: citizenId }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "30d" });
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  return token;
};

// AUTH LOGIC
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const citizenExists = await Citizen.findOne({ email });
    if (citizenExists) return res.status(400).json({ message: "Citizen already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const citizen = await Citizen.create({ name, email, password: hashedPassword });

    if (citizen) {
      generateTokenAndSetCookie(res, citizen._id);
      res.status(201).json({ 
        _id: citizen._id, 
        name: citizen.name, 
        email: citizen.email, 
        yearlyIncome: 0,
        isProfileComplete: false 
      });
    }
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const citizen = await Citizen.findOne({ email });
    if (citizen && (await bcrypt.compare(password, citizen.password))) {
      generateTokenAndSetCookie(res, citizen._id);
      res.status(200).json(citizen);
    } else { res.status(401).json({ message: "Invalid credentials" }); }
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
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

export const getMe = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.user._id);
    if (citizen) res.status(200).json(citizen);
    else res.status(404).json({ message: "Not found" });
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
};