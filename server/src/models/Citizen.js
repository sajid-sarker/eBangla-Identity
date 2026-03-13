import mongoose from "mongoose";

const citizenSchema = new mongoose.Schema(
  {
    // nid: {
    //   type: String,
    //   required: true,
    // },
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
    // dateOfBirth: {
    //   type: Date,
    //   required: true,
    // },
    // gender: {
    //   type: String,
    //   required: true,
    // },
    // address: {
    //   type: {
    //     division: { type: String, required: true },
    //     district: { type: String, required: true },
    //     upazilla: { type: String, required: true },
    //     village: { type: String, required: true },
    //   },
    //   required: true,
    // },
    // maritalStatus: {
    //   type: String,
    //   enum: ["single", "married", "widowed"],
    //   required: true,
    // },
    // phone: {
    //   type: String,
    //   required: true,
    // },
    // passport: {
    //   type: String,
    //   required: true,
    // },
    // driving_license: {
    //   type: String,
    //   required: true,
    //   default: null,
    // },
    // family: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Family",
    //   required: false,
    // },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

const Citizen = mongoose.model("Citizen", citizenSchema);

export default Citizen;
