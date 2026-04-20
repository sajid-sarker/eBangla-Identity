import TaxRecord from "../models/TaxRecord.js";
import Citizen from "../models/Citizen.js";
import { sendTaxStatusEmail } from "../utils/googleEmailService.js";

/**
 * @desc    Set official income for a specific year and auto-calculate tax
 * @route   PATCH /api/tax/admin/update-citizen/:citizenId
 * @access  Private/Admin
 * @note    Uses findOneAndUpdate to ensure only ONE record exists per year per citizen.
 */
export const setOfficialIncome = async (req, res) => {
  try {
    const { citizenId } = req.params;
    const { year, annualIncome } = req.body;

    if (!year || annualIncome === undefined) {
      return res.status(400).json({ message: "Year and Income are required" });
    }

    const income = Number(annualIncome);

    // AUTO-TAX CALCULATION LOGIC (0% up to 350k, 5% above)
    const freeLimit = 350000;
    const calculatedTax = income > freeLimit ? (income - freeLimit) * 0.05 : 0;

    // findOneAndUpdate with upsert: true acts as "Create or Update"
    // It searches for the specific User + Year combination.
    const record = await TaxRecord.findOneAndUpdate(
      { user: citizenId, fiscalYear: year }, 
      { 
        totalIncome: income, 
        taxAmount: calculatedTax, 
        status: "Pending" // Defaults back to "Unpaid" on update for re-verification
      },
      { 
        upsert: true, 
        returnDocument: "after", 
        setDefaultsOnInsert: true 
      }
    );

    res.status(200).json({
      message: `Official record for ${year} saved. Tax calculated: ৳${calculatedTax.toLocaleString()}`,
      record
    });
  } catch (error) {
    console.error("Set Income Error:", error);
    res.status(500).json({ message: "Failed to set official income" });
  }
};

/**
 * @desc    Get tax records for a specific citizen
 * @route   GET /api/tax/admin/citizen/:citizenId
 */
export const getCitizenTaxRecords = async (req, res) => {
  try {
    const { citizenId } = req.params;
    
    // Sort by fiscalYear descending. 
    // This will group any remaining old duplicates together.
    const records = await TaxRecord.find({ user: citizenId })
      .sort({ fiscalYear: -1, createdAt: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching citizen tax records" });
  }
};

/**
 * @desc    Update tax status (Approve/Reject)
 * @route   PATCH /api/tax/admin/status/:recordId
 */
export const updateTaxStatus = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { status } = req.body;

    if (!['Paid', 'Pending', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    const record = await TaxRecord.findByIdAndUpdate(
      recordId,
      { status },
      { returnDocument: "after" }
    );

    if (!record) return res.status(404).json({ message: "Record not found" });

    // Send email notification to the citizen
    // We fetch the citizen details to get email and name
    const citizen = await Citizen.findById(record.user);
    if (citizen && citizen.email) {
      sendTaxStatusEmail(citizen.email, citizen.name, record, status);
    }

    res.status(200).json({ 
        message: `Tax record for ${record.fiscalYear} marked as ${status}`, 
        record 
    });
  } catch (error) {
    res.status(500).json({ message: "Status update failed" });
  }
};