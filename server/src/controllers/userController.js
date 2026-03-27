import Citizen from "../models/Citizen.js";

// @desc    Get user data
// @route   GET /api/user/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.user._id);
    if (citizen) {
      res.status(200).json({
        _id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        nid: citizen.nid,
        dateOfBirth: citizen.dateOfBirth,
        gender: citizen.gender,
        phone: citizen.phone,
        address: citizen.address,
        maritalStatus: citizen.maritalStatus,
        isProfileComplete: citizen.isProfileComplete,
      });
    } else {
      res.status(404).json({ message: "Citizen not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
