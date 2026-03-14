import mongoose from "mongoose";

const taxRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },
    fiscalYear: { type: String, required: true },
    totalIncome: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Overdue"],
      default: "Pending",
    },
    downloadUrl: { type: String },
  },
  { timestamps: true },
);

const TaxRecord = mongoose.model("TaxRecord", taxRecordSchema);
export default TaxRecord;
