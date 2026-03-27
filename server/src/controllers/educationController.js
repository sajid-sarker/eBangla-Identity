import EducationRecord from "../models/EducationRecord.js";

// @desc    Get all education records for the logged-in user
// @route   GET /api/education
// @access  Private
export const getEducationRecords = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch records sorted by passingYear in descending order
    const records = await EducationRecord.find({ citizenId: userId }).sort({
      passingYear: -1,
    });

    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching education records:", error);
    res.status(500).json({ message: "Server error while fetching education records" });
  }
};
