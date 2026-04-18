import Citizen from "../models/Citizen.js";
import MedicalRecord from "../models/MedicalRecord.js";
import PoliceRecord from "../models/PoliceRecord.js";
import TaxRecord from "../models/TaxRecord.js";

export const getCitizenScore = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all records in parallel for better performance
    const [citizen, medicalRecord, policeRecord, taxRecord] = await Promise.all(
      [
        Citizen.findById(userId).select("-profilePicture.data"),
        MedicalRecord.findOne({ user: userId }),
        PoliceRecord.findOne({ citizen: userId }),
        TaxRecord.findOne({ user: userId }).sort({ createdAt: -1 }),
      ],
    );

    if (!citizen) {
      return res.status(404).json({ message: "Citizen not found" });
    }

    const TAX_THRESHOLD = 300000;
    const isTaxApplicable =
      citizen.yearlyIncome &&
      citizen.yearlyIncome >= TAX_THRESHOLD &&
      citizen.profession !== "Student";

    const hasPoliceCase = policeRecord?.cases?.some((c) =>
      ["pending", "under_investigation", "under_trial"].includes(c.status),
    );
    const isVerified = citizen.isProfileComplete; // or whatever verifies the profile
    const medicalCheckup = medicalRecord ? true : false; // simplistic check, based on whether they uploaded anything
    const taxPaid = taxRecord?.status === "Paid";

    let earned = 0;
    let breakdown = [];

    // ================= TAX =================
    if (isTaxApplicable || taxPaid) {
      if (taxPaid) {
        earned += 25;
        breakdown.push("Tax compliance: +25");
      } else {
        breakdown.push("Tax pending: 0/25");
      }
    } else {
      earned += 25; // Default points if not applicable
      breakdown.push("Tax not applicable: +25");
    }

    // ================= POLICE =================
    if (!hasPoliceCase) {
      earned += 25;
      breakdown.push("No police record: +25");
    } else {
      breakdown.push("Police case: 0/25");
    }

    // ================= PROFILE =================
    if (isVerified) {
      earned += 25;
      breakdown.push("Verified Profile: +25");
    } else {
      breakdown.push("Profile unverified: 0/25");
    }

    // ================= MEDICAL =================
    if (medicalCheckup) {
      earned += 25;
      breakdown.push("Medical Active: +25");
    } else {
      breakdown.push("Medical inactive: 0/25");
    }

    let score = earned;

    // Status
    let status = "";
    if (score >= 80) status = "Excellent";
    else if (score >= 60) status = "Good";
    else if (score >= 40) status = "Average";
    else status = "Risky";

    res.json({
      score,
      status,
      breakdown,
      earned,
      total: 100,
    });
  } catch (error) {
    console.error("Score calculation error:", error);
    res.status(500).json({ message: "Error calculating score" });
  }
};
