import mongoose from "mongoose";

const educationRecordSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
    required: true,
  },
  qualification: {
    type: String,
    required: true,
    enum: [
      "Primary",
      "Secondary",
      "Higher Secondary",
      "Bachelors",
      "Masters",
      "PhD",
      "Other",
    ],
  },
  degreeName: {
    type: String,
  },
  institution: {
    type: String,
    required: true,
  },
  passingYear: {
    type: Number,
    required: true,
  },
  document: {
    data: Buffer,
    contentType: String,
    originalName: String,
  },
  status: {
    type: String,
    enum: ["Pending", "Verified", "Rejected"],
    default: "Pending",
  },
}, { timestamps: true });

const EducationRecord = mongoose.model(
  "EducationRecord",
  educationRecordSchema,
);

export default EducationRecord;
