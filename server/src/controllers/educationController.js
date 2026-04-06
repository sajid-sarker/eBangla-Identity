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

// @desc    Upload/Create new education record
// @route   POST /api/education/document
// @access  Private
export const uploadEducationDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const { qualification, degreeName, institution, passingYear } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    if (!qualification || !institution || !passingYear) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Create a new record with the uploaded document
    const record = new EducationRecord({
      citizenId: userId,
      qualification,
      degreeName,
      institution,
      passingYear,
      document: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
      },
      status: "Pending", // explicitly set to Pending
    });

    await record.save();

    res.status(201).json({
      message: "Education record submitted successfully for verification",
      record: {
        _id: record._id,
        qualification: record.qualification,
        status: record.status,
      },
    });
  } catch (error) {
    console.error("Error creating education record:", error);
    res.status(500).json({ message: "Server error while creating record" });
  }
};

// @desc    Get education document
// @route   GET /api/education/:id/document
// @access  Private
export const getEducationDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const record = await EducationRecord.findOne({ _id: id, citizenId: userId });

    if (!record || !record.document || !record.document.data) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.set("Content-Type", record.document.contentType);
    res.set("Content-Disposition", `inline; filename="${record.document.originalName}"`);
    res.send(record.document.data);
  } catch (error) {
    console.error("Error fetching education document:", error);
    res.status(500).json({ message: "Server error while fetching document" });
  }
};
