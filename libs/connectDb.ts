import mongoose from "mongoose";
import dns from "node:dns/promises";

export default async function connectDb() {
  try {
    // Use public DNS to fix querySrv ECONNREFUSED on Windows (SRV lookup fails with default DNS)
    dns.setServers(["1.1.1.1", "8.8.8.8"]);

    const uri = process.env.MONGO_URI_STANDARD || process.env.MONGO_URI;
    await mongoose.connect(String(uri));
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // If SRV lookup failed, suggest using standard connection string from Atlas
    if (
      error instanceof Error &&
      error.message.includes("querySrv") &&
      error.message.includes("ECONNREFUSED")
    ) {
      console.error(
        "Tip: Set MONGO_URI_STANDARD in .env with the non-SRV connection string from Atlas (Connect → Connect your application → use the standard format)."
      );
    }
    throw error;
  }
};
