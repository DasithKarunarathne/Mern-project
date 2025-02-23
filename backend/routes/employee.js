import express from "express";
//import employee from "../models/Employee.js";
import Employee from "../models/Employee.js";

const router = express.Router();


router.post("/", async (req,res) => {

    const employee = req.body;
    //write something to make sure all fields are filled
   
 const newEmployee = new Employee(employee);


 try {
    const NewEmploy = await newEmployee.save();
    res.status(201).json({success: true, data : NewEmploy});
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


router.get("/info/:id", async (req,res)=>{

    try {

       const empId =  req.params.id;
       const employee = await Employee.findOne({employeeId:empId});

       if(!employee){
        res.status(404).json({success:false, message:"Enter a valid Employee ID"});
       }
       res.status(202).json({success:true, data: employee});

        
    } catch (error) {
        res.status(505).json({success:false, message:error.message});
    }



})


export default router;