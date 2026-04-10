import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const args = process.argv.slice(2);
const params = {};

args.forEach((arg, index) => {
  if (arg.startsWith("--")) {
    const key = arg.slice(2);
    const value = args[index + 1];
    if (value && !value.startsWith("--")) {
      params[key] = value;
    }
  }
});

const { name, email, password, role } = params;

if (!name || !email || !password || !role) {
  console.log("Usage: node server/src/scripts/createAdmin.js --name \"Name\" --email \"email@example.com\" --password \"password\" --role \"superuser|police|medical|general\"");
  process.exit(1);
}

const validRoles = ["superuser", "police", "medical", "general"];
if (!validRoles.includes(role)) {
  console.log(`Invalid role. Valid roles are: ${validRoles.join(", ")}`);
  process.exit(1);
}

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log(`Admin with email ${email} already exists.`);
      process.exit(1);
    }

    const newAdmin = new Admin({
      name,
      email,
      password,
      role,
    });

    await newAdmin.save();
    console.log(`Admin created successfully!`);
    console.log(`ID: ${newAdmin.adminId}`);
    console.log(`Name: ${newAdmin.name}`);
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Role: ${newAdmin.role}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error creating admin: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();
