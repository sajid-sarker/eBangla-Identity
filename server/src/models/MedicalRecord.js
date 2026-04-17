import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
  // Link to the Login Account
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  
  bloodGroup: { type: String, required: true },
  height: { type: Number },
  weight: { type: Number },

  // Array fields matching your Admin Form
  diagnoses: [{
    condition: String,  // Matches 'condition' in Admin form
    hospital: String,
    doctor: String,
    icdCode: String,
    status: { type: String, default: "Active" },
    date: { type: Date, default: Date.now }
  }],

  vaccinations: [{
    name: String,      // Matches 'name' in Admin form
    hospital: String,
    doseNumber: Number,
    date: { type: Date, default: Date.now }
  }],

  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("MedicalRecord", medicalRecordSchema);