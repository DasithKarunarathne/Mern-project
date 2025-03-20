import Salary from "../models/Salary.js";
import Employee from "../../backend-hr/models/employee.js";

export const salarycalculation = async (req,res)=>{//generate salaryyy one
//githubb desktop
    try {
        
        const {month} = req.body;
        if(!month){
            return res.status(404).json({success:false, message:"Select a date"});
        }
        //when a new emplloyee is added should generate slary 
        const existingSalaries = await Salary.find({month});

        if (!existingSalaries) {
            return res.status(500).json({ success: false, message: "Error fetching existing salaries" });
          }

        const existingEmployeeIDs = existingSalaries.map(sal=>sal.empID); 

        const getAllEmployees = await Employee.find();

        if(getAllEmployees.length===0){
            return res.status(400).json({success:false, message:"No employees found"});//this message thing prints in the screen MANAGE THIS 
        }
        //make sure to retrieve employees joined a certain month generate only to that relavent month 
        //An employee joined on april cannot have a salary on february
        const salRecords = [];

        for(let employee of getAllEmployees){

            if(!existingEmployeeIDs.includes(employee.empID)){

            const overtimepay = employee.overtimeHours * employee.overtimeRate;
            const epf = employee.basicSalary*0.08;//12% kapenawada?????
            const etf = employee.basicSalary*0.03;
            const netsalary = employee.basicSalary+overtimepay-epf;

            const salary = new Salary({

                employeeId:employee.empID,
                employeeName: employee.name,
                month: month,
                basicSalary:employee.basicSalary,
                overtimeHours:employee.overtimeHours,
                overtimeRate: employee.overtimeRate,
                epf:epf,
                etf:etf,
                netSalary:netsalary,
                status:"Pending",
                paymentDate:null


            });

             salRecords.push(salary);
        }
        }

        await Salary.insertMany(salRecords);
        res.status(201).json({Message: "Salary calculated", salaries:salRecords});


    } catch (error) {
        res.status(500).json({success: false, message:"Error calculatig salaries", error:error.message});
    }
    

};

export const getsalaries = async(req,res) =>{

    
    try {
        const {month} = req.params;

        if (!month) {
            return res.status(400).json({ success: false, message: "Month is required" });
          }

        const salaries =await Salary.find({month});
        res.status(200).json(salaries);
    } catch (error) {
        res.status(500).json({Message: "Error fetching salaries", error});
    }


};


export const markSalPaid = async(req,res)=>{

    try {
        
        const {salaryId} = req.params;
        const salary = await Salary.findById(salaryId);
        //add a copy to ledger , p/l ,sofp calculation?????
        if(!salary) 
            return res.status(400).json({Message:"Salary record not found"});

        salary.status="Completed";
        salary.paymentDate= new Date();

        await salary.save();
        res.status(200).json({success:true, message:"Salary marked as paid"});

        

    } catch (error) {
        res.status(500).json({success: false,message: "Error making salary as paid"})
    }


};


 