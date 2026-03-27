import app from "./app.js";
import { connectDB } from "./config/db.js";
import { PORT, NODE_ENV } from "./config/env.js";

app.listen(PORT, () => {
  connectDB();
  console.log(`Server started at http://localhost:${PORT} in ${NODE_ENV} mode`);
});
