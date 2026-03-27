import mongoose from "mongoose";
import dns from "dns";
import { MONGO_URI } from "./env.js";

export const connectDB = async () => {
  try {
    dns.setServers(["8.8.8.8"]); // Google Public DNS to bypass local resolver
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // 1 means failure, 0 means success
  }
};
