import Citizen from "../models/Citizen.js";
import { updateTaxRecord } from "./taxController.js";

// @desc    Get user data
// @route   GET /api/user/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    if (req.user) {
      const userObj = req.user.toObject ? req.user.toObject() : req.user;
      res.status(200).json({
        ...userObj,
        isAdmin: req.user.isAdmin || false,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Upload profile picture
// @route   POST /api/user/profile-picture
// @access  Private
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const citizen = await Citizen.findById(req.user._id);
    if (!citizen) {
      return res.status(404).json({ message: "Citizen not found" });
    }

    citizen.profilePicture = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };

    await citizen.save();

    res.status(200).json({ message: "Profile picture updated successfully" });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Server error while uploading profile picture" });
  }
};

// @desc    Get profile picture by citizen ID
// @route   GET /api/user/profile-picture/:id
// @access  Public
export const getProfilePicture = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.params.id).select("profilePicture");

    if (!citizen || !citizen.profilePicture || !citizen.profilePicture.data) {
      return res.status(404).json({ message: "No profile picture found" });
    }

    res.set("Content-Type", citizen.profilePicture.contentType);
    res.set("Cache-Control", "no-cache");
    res.send(citizen.profilePicture.data);
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    res.status(500).json({ message: "Server error while fetching profile picture" });
  }
};

// @desc    Update user profile data
// @route   PUT /api/user/profile
// @access  Private
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
