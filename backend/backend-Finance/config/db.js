import { set, connect } from "mongoose";
import dotenv from "dotenv";

//require("dotenv").config();
const dburl = process.env.MONGO_URI;

set("strictQuery", true);

const connection =async()=>{

    try {
        await connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // Increase server selection timeout
            socketTimeoutMS: 45000,
        });
        console.log("MongoDB Connected~");
    } catch (e) {
        console.error(e.message);
        process.exit();
    }
};

export default connection;