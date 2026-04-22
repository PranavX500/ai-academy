import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

// Railway provides process.env.PORT automatically. 
// We fallback to 8080 only if it's missing.
const PORT = process.env.PORT || 8080;

async function start() {
  try {
    console.log("⏳ Connecting to Database...");
    await connectDB();
    
    // Binding to "0.0.0.0" is MANDATORY for cloud deployments
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is live on port: ${PORT}`);
      console.log(`📡 Listening for external requests on 0.0.0.0`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    // Exit so Railway knows the container crashed and can try to restart it
    process.exit(1); 
  }
}

start();
