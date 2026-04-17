import { config } from "dotenv";

// config({ path: `env.${process.env.NODE_ENV || "development"}.local` });
config({ path: "server/.env" });

export const {
  PORT,
  NODE_ENV,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  EMAIL_FROM,
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI,
  GMAIL_REFRESH_TOKEN,
} = process.env;
