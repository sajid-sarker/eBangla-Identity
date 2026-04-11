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
        MedicalRecord.findOne({ citizen: userId }),
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
      ["pending", "under_investigation"].includes(c.status),
    );
    const isVerified = citizen.isProfileComplete; // or whatever verifies the profile
    const medicalCheckup = medicalRecord ? true : false; // simplistic check, based on whether they uploaded anything
    const taxPaid = taxRecord?.status === "Paid";

    let earned = 0;
    let total = 0;
    let breakdown = [];

    // ================= TAX =================
    if (isTaxApplicable || taxPaid) {
      // even if under threshold, if they paid it counts
      total += 20;

      if (taxPaid) {
        earned += 20;
        breakdown.push("Tax compliance: +20");
      } else {
        breakdown.push("Tax pending: 0/20");
      }
    } else {
      breakdown.push("Tax not applicable");
    }

    // ================= POLICE =================
    total += 30;
    if (!hasPoliceCase) {
      earned += 30;
      breakdown.push("No police record: +30");
    } else {
      breakdown.push("Police case: 0/30");
    }

    // ================= PROFILE =================
    total += 20;
    if (isVerified) {
      earned += 20;
      breakdown.push("Verified Profile: +20");
    } else {
      breakdown.push("Profile unverified: 0/20");
    }

    // ================= MEDICAL =================
    total += 10;
    if (medicalCheckup) {
      earned += 10;
      breakdown.push("Medical Active: +10");
    } else {
      breakdown.push("Medical inactive: 0/10");
    }

    // 🔥 Normalized score
    let score = total > 0 ? Math.round((earned / total) * 100) : 0;

    // Status
    let status = "";
    if (score >= 80) status = "Excellent";
    else if (score >= 60) status = "Good";
    else if (score >= 40) status = "Average";
    else status = "Risky";

    // 🔥 Optional extra info (very useful)
    res.json({
      score,
      status,
      breakdown,
      earned,
      total,
    });
  } catch (error) {
    console.error("Score calculation error:", error);
    res.status(500).json({ message: "Error calculating score" });
  }
};
