import express from "express";
//import employee from "../models/Employee.js";
import Employee from "../models/Employee.js";

const router = express.Router();


router.post("/", async (req,res) => {

    const employee = req.body;
    //write something to make sure all fields are filled
   
 const newEmployee = new Employee(employee);


 try {
    await newEmployee.save();
    res.status(201).json({success: true, data : newEmployee});
 }catch(error){
    console.error("Error could not create an employee", error.message);
    res.status(500).json({ success: false, message: "Server Error"});
 }
        
})

router.get("/info", async (req,res)=>{
try {
    const emploInfo = await Employee.find();
    res.status(200).json({success:true, data :emploInfo});

    
} catch (error) {
    console.log(error);
}
    



})

export default router;