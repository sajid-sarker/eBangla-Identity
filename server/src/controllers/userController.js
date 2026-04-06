import Citizen from "../models/Citizen.js";

// @desc    Get user data
// @route   GET /api/user/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.user._id);
    if (citizen) {
      res.status(200).json(citizen);
    } else {
      res.status(404).json({ message: "Citizen not found" });
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
