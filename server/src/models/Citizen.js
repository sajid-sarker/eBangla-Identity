import mongoose from "mongoose";

const familyMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  relation: {
    type: String,
    required: true,
  },
  smartNID: {
    type: String,
    required: true,
  },
});

const citizenSchema = new mongoose.Schema(
  {
    nid: {
      type: String,
      required: false,
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
    dateOfBirth: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    address: {
      type: {
        division: { type: String, required: false },
        district: { type: String, required: false },
        upazilla: { type: String, required: false },
        village: { type: String, required: false },
      },
      required: false,
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "widowed"],
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    passport: {
      type: String,
      required: false,
    },
    yearlyIncome: {
      type: Number,
      required: false,
      default: 0,
    },
    familyMembers: [familyMemberSchema],
    profilePicture: {
      data: { type: Buffer, required: false },
      contentType: { type: String, required: false },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// citizenSchema.virtual("isProfileComplete").get(function () {
//   return !!(
//     this.nid &&
//     this.dateOfBirth &&
//     this.gender &&
//     this.phone &&
//     this.maritalStatus &&
//     this.yearlyIncome !== undefined &&
//     this.address &&
//     this.address.division &&
//     this.address.district &&
//     this.address.upazilla &&
//     this.address.village
//   );
// });

citizenSchema.virtual("isProfileComplete").get(function () {
  const requiredFields = [
    "nid",
    "dateOfBirth",
    "gender",
    "phone",
    "maritalStatus",
    "yearlyIncome",
    "address.division",
    "address.district",
    "address.upazilla",
    "address.village",
  ];

  return requiredFields.every((field) => {
    const value = field.split(".").reduce((obj, key) => obj?.[key], this);
    return value !== undefined && value !== null && value !== "";
  });
});

const Citizen = mongoose.model("Citizen", citizenSchema);

export default Citizen;
