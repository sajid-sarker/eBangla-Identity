import MedicalRecord from "../models/MedicalRecord.js";
import Citizen from "../models/Citizen.js";
import { sendMedicalUpdateEmail } from "../utils/googleEmailService.js";

// @desc    Citizen: Get my own records
export const getMyMedicalRecords = async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ user: req.user._id });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Admin: Get citizen medical records by NID
export const getAdminMedicalRecordByCitizen = async (req, res) => {
  try {
    const { nid } = req.params;
    const citizen = await Citizen.findOne({ nid });
    
    if (!citizen) {
      return res.status(404).json({ message: "Citizen not found" });
    }

    const targetId = citizen.userId || citizen._id;
    const record = await MedicalRecord.findOne({ user: targetId });
    
    if (record) {
      // Sort diagnoses and vaccinations by date (newest first)
      const sortedRecord = record.toObject();
      sortedRecord.diagnoses = (sortedRecord.diagnoses || []).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      sortedRecord.vaccinations = (sortedRecord.vaccinations || []).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      return res.status(200).json(sortedRecord);
    }
    
    // Send the generic informative notification email to the citizen
    if (citizen && citizen.email) {
      sendMedicalUpdateEmail(citizen.email, citizen.name);
    }
    
    res.status(200).json({});
  } catch (error) {
    console.error("Fetch Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Admin: Update citizen data
export const updateMedicalRecord = async (req, res) => {
  const { nid, bloodGroup, height, weight, diagnoses, vaccinations } = req.body;
  try {
    const citizen = await Citizen.findOne({ nid });
    if (!citizen) return res.status(404).json({ message: "Citizen not found" });

    // Linkage: Use the userId from the citizen profile to find the login record
    const targetId = citizen.userId || citizen._id;

    // Filter out empty rows before saving
    const cleanDiagnoses = (diagnoses || []).filter(d => d.condition && d.condition.trim() !== "");
    const cleanVaccinations = (vaccinations || []).filter(v => v.name && v.name.trim() !== "");

    const updatedRecord = await MedicalRecord.findOneAndUpdate(
      { user: targetId },
      {
        bloodGroup,
        height: Number(height),
        weight: Number(weight),
        diagnoses: cleanDiagnoses,
        vaccinations: cleanVaccinations,
        addedBy: req.user._id 
      },
      { returnDocument: "after", upsert: true }
    );

    res.status(200).json({ success: true, message: "Medical History Updated Successfully!" });
  } catch (error) {
    console.error("Update Error:", error.message);
    res.status(500).json({ message: "Update failed" });
  }
};