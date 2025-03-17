const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();



require("dotenv").config();
console.log("MongoDB URL:", process.env.MONGO_URL); // Debugging

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

const URL = process.env.MONGO_URL;

mongoose.connect(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB connection success");
});

const productRouter = require("../backend-product/routes/products.js");

app.use("/product", productRouter);

app.listen(PORT, () => {
  console.log(`Server is up and running on port number: ${PORT}`);
});