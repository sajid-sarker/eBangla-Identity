import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Counter from "./Counter.js";

const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["superuser", "police", "medical", "general"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save", async function () {
  const admin = this;

  // Hash password if modified
  if (admin.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
  }

  // Only run if it's a new document and adminId is not already set
  if (admin.isNew && !admin.adminId) {
    let prefix = "";
    switch (admin.role) {
      case "superuser":
        prefix = "SU";
        break;
      case "medical":
        prefix = "MED";
        break;
      case "police":
        prefix = "POL";
        break;
      case "general":
        prefix = "GEN";
        break;
      default:
        prefix = "ADM";
    }

    const counter = await Counter.findOneAndUpdate(
      { id: prefix },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const sequenceNum = counter.seq.toString().padStart(6, "0");
    admin.adminId = `${prefix}-${sequenceNum}`;
  }
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
