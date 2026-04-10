import mongoose from "mongoose";

const taxRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },
    fiscalYear: { 
      type: String, 
      required: true 
    },
    totalIncome: { 
      type: Number, 
      default: 0 
    },
    taxAmount: { 
      type: Number, 
      default: 0 
    },
    status: {
      type: String,
      // Added "Rejected" to match your Admin Panel buttons
      enum: ["Paid", "Pending", "Rejected"], 
      default: "Pending", 
    },
    // Useful if you store the generated PDF path later
    downloadUrl: { type: String },
  },
  { timestamps: true },
);

const TaxRecord = mongoose.model("TaxRecord", taxRecordSchema);
export default TaxRecord;