const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const dburl = process.env.MONGO_URI;

mongoose.set("strictQuery", true);

const connection = async () => {
    try {
        await mongoose.connect(dburl);
        console.log("MongoDB Connected~");
    } catch (e) {
        console.error("MongoDB Connection Error:", e.message);
        process.exit(1);
    }
};

module.exports = connection;