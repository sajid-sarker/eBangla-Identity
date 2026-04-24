import EducationRecord from "../models/EducationRecord.js";
import Citizen from "../models/Citizen.js";
import {
  sendEducationStatusEmail,
  sendAdminAddedEducationEmail,
} from "../utils/googleEmailService.js";

// @desc    Get all education records for the logged-in user
// @route   GET /api/education
// @access  Private
export const getEducationRecords = async (req, res) => {
  try {
    let targetCitizenId = req.user._id;

    if (req.user.isAdmin && req.query.citizenId) {
      targetCitizenId = req.query.citizenId;
    }

    const records = await EducationRecord.find({ citizenId: targetCitizenId })
      .select("-document.data")
      .sort({
        passingYear: -1,
      });

    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching education records:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching education records" });
  }
};

// @desc    Upload/Create new education record
// @route   POST /api/education/document
// @access  Private
export const uploadEducationDocument = async (req, res) => {
  try {
    let targetCitizenId = req.user._id;
    if (req.user.isAdmin && req.body.citizenId) {
      targetCitizenId = req.body.citizenId;
    }

    const { qualification, degreeName, institution, passingYear } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    if (!qualification || !institution || !passingYear) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Create a new record with the uploaded document
    const record = new EducationRecord({
      citizenId: targetCitizenId,
      qualification,
      degreeName,
      institution,
      passingYear,
      document: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
      },
      status: req.user.isAdmin ? "Verified" : "Pending", // Admins skip pending queue
    });

    await record.save();

    // Send email notification if admin added the record
    if (req.user.isAdmin) {
      const citizen = await Citizen.findById(targetCitizenId);
      if (citizen && citizen.email) {
        sendAdminAddedEducationEmail(citizen.email, citizen.name, record);
      }
    }

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
    const { id } = req.params;

    let query = { _id: id };

    // Standard users can only view their own documents
    if (!req.user.isAdmin) {
      query.citizenId = req.user._id;
    }

    const record = await EducationRecord.findOne(query);

    if (!record || !record.document || !record.document.data) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.set("Content-Type", record.document.contentType);
    res.set(
      "Content-Disposition",
      `inline; filename="${record.document.originalName}"`,
    );
    res.send(record.document.data);
  } catch (error) {
    console.error("Error fetching education document:", error);
    res.status(500).json({ message: "Server error while fetching document" });
  }
};

// @desc    Update education record status (Admin)
// @route   PATCH /api/education/admin/:id/status
// @access  Private/Admin
export const updateEducationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Verified", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const record = await EducationRecord.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    ).select("-document.data");

    if (!record) {
      return res.status(404).json({ message: "Education record not found" });
    }

    // Send email notification to the citizen
    // We fetch the citizen details to get email and name
    const citizen = await Citizen.findById(record.citizenId);
    if (citizen && citizen.email) {
      sendEducationStatusEmail(citizen.email, citizen.name, record, status);
    }

    res.status(200).json({
      message: `Education record ${status.toLowerCase()} successfully`,
      record,
    });
  } catch (error) {
    console.error("Error updating education status:", error);
    res.status(500).json({ message: "Server error while updating status" });
  }
};

// @desc    Update education record by user
// @route   PUT /api/education/:id
// @access  Private
export const updateEducationRecord = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { qualification, degreeName, institution, passingYear } = req.body;

    const record = await EducationRecord.findOne({ _id: id, citizenId: userId });

    if (!record) {
      return res.status(404).json({ message: "Education record not found" });
    }

    if (record.status === "Verified") {
      return res.status(403).json({ message: "Cannot edit a verified qualification" });
    }

    if (qualification) record.qualification = qualification;
    if (degreeName !== undefined) record.degreeName = degreeName;
    if (institution) record.institution = institution;
    if (passingYear) record.passingYear = passingYear;

    if (req.file) {
      record.document = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
      };
    }

    // Force re-verification
    record.status = "Pending";

    await record.save();

    res.status(200).json({
      message: "Education record updated successfully",
      record: {
        _id: record._id,
        qualification: record.qualification,
        status: record.status,
      },
    });
  } catch (error) {
    console.error("Error updating education record:", error);
    res.status(500).json({ message: "Server error while updating record" });
  }
};
