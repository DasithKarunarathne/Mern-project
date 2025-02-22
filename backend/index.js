const express = require("express");
const dbconnection = require ("./config/db");
const feedbackroutes = require("./routes/feedback.js");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");  
const cors = require("cors");


require("dotenv").config();
const app = express();


const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true}));

//dbconnection 
dbconnection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/",(req,res) => res.send("Hello world") );

app.use("/api/feedback",feedbackroutes );



app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));

