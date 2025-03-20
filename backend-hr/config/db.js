import { set, connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Ensure MONGO_URI is available here too

set("strictQuery", true);

const dbconnection = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI is undefined in environment variables");
        }
        await connect(uri); // Removed deprecated options
        console.log("MongoDB Connected~");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

export default dbconnection;