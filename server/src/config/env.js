import { config } from "dotenv";

// config({ path: `env.${process.env.NODE_ENV || "development"}.local` });
config(".env");

export const { PORT, NODE_ENV, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN } =
process.env;
