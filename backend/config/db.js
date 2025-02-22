const mongoose = require("mongoose");
const dotenv = require("dotenv");

require("dotenv").config();
const dburl = process.env.MONGO_URI;

mongoose.set("strictQuery", true);

const connection =async()=>{

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected~");
    } catch (e) {
        console.error(e.message);
        process.exit();
    }
};

module.exports = connection;