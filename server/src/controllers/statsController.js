import MedicalRecord from "../models/MedicalRecord.js";
import PoliceRecord from "../models/PoliceRecord.js";
import TaxRecord from "../models/TaxRecord.js";
import EducationRecord from "../models/EducationRecord.js";

// @desc    Get dashboard statistics for the logged-in user
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all records in parallel for better performance
    const [medicalRecord, policeRecord, latestTaxRecord, educationRecords] =
      await Promise.all([
        MedicalRecord.findOne({ citizen: userId }),
        PoliceRecord.findOne({ citizen: userId }),
        TaxRecord.findOne({ user: userId }).sort({ createdAt: -1 }),
        EducationRecord.find({ citizenId: userId })
          .select("-document.data")
          .sort({ passingYear: -1 }),
      ]);

    // Format medical stats
    let medicalStats = {
      count: 0,
      bloodGroup: "Not set",
      lastUpdated: null,
    };

    if (medicalRecord) {
      medicalStats = {
        count:
          (medicalRecord.diagnoses?.length || 0) +
          (medicalRecord.allergies?.length || 0) +
          (medicalRecord.vaccinations?.length || 0),
        bloodGroup: medicalRecord.bloodGroup || "Not set",
        lastUpdated: medicalRecord.updatedAt,
      };
    }

    // Format police stats
    let policeStats = {
      count: 0,
      status: "Clear",
      lastUpdated: null,
    };

    if (policeRecord) {
      const activeCases =
        policeRecord.cases?.filter((c) =>
          ["pending", "under_investigation", "under_trial"].includes(c.status),
        ).length || 0;

      policeStats = {
        count: policeRecord.cases?.length || 0,
        status: activeCases > 0 ? `${activeCases} Active Cases` : "Clear",
        lastUpdated: policeRecord.updatedAt,
      };
    }

    // Format tax stats
    let taxStats = {
      taxAmount: 0,
      fiscalYear: "N/A",
      lastUpdated: null,
    };

    if (latestTaxRecord) {
      taxStats = {
        taxAmount: latestTaxRecord.taxAmount || 0,
        fiscalYear: latestTaxRecord.fiscalYear || "N/A",
        lastUpdated: latestTaxRecord.updatedAt,
      };
    }

    // Family stats from req.user
    const familyStats = {
      count: req.user.familyMembers?.length || 0,
      lastUpdated: req.user.updatedAt,
    };

    // Format education stats
    let educationStats = {
      count: educationRecords.length,
      latestQualification:
        educationRecords.length > 0 ? educationRecords[0].qualification : "N/A",
      lastUpdated:
        educationRecords.length > 0 ? educationRecords[0].updatedAt : null,
    };

    res.status(200).json({
      medical: medicalStats,
      police: policeStats,
      family: familyStats,
      tax: taxStats,
      education: educationStats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error while fetching stats" });
  }
};
