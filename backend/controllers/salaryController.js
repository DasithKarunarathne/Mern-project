import Salary from "../models/Salary.js";
import Employee from "../../backend-hr/models/employee.js";

export const salarycalculation = async (req, res) => {
    try {
      console.log("Request body:", req.body); // Log the request body
      const { month } = req.body;
      if (!month) {
        return res.status(400).json({ success: false, message: "Month is required" });
      }
  
      console.log("Fetching existing salaries for month:", month);
      const existingSalaries = await Salary.find({ month });
      console.log("Existing salaries:", existingSalaries);
  
      const existingEmployeeIDs = new Set(existingSalaries.map(sal => sal.employeeId));
      console.log("Existing employee IDs:", existingEmployeeIDs);
  
      console.log("Fetching all employees");
      const getAllEmployees = await Employee.find().maxTimeMS(30000); // Increase timeout
      console.log("Total employees fetched:", getAllEmployees.length);
  
      if (getAllEmployees.length === 0) {
        return res.status(400).json({ success: false, message: "No employees found" });
      }
  
      const salRecords = [];
      for (let employee of getAllEmployees) {
        if (!existingEmployeeIDs.has(employee.empID)) {
          console.log("Calculating salary for employee:", employee.empID);
          const overtimepay = employee.overtimeHours * employee.overtimeRate;
          const epf = employee.basicSalary * 0.08;
          const etf = employee.basicSalary * 0.03;
          const netsalary = employee.basicSalary + overtimepay - epf;
  
          const salary = new Salary({
            employeeId: employee.empID,
            employeeName: employee.empname,
            month: month,
            basicSalary: employee.basicSalary,
            overtimeHours: employee.overtimeHours,
            overtimeRate: employee.overtimeRate,
            epf: epf,
            etf: etf,
            netSalary: netsalary,
            status: "Pending",
            paymentDate: null,
          });
  
          salRecords.push(salary);
        }
      }
  
      if (salRecords.length > 0) {
        console.log("Inserting salary records:", salRecords);
        await Salary.insertMany(salRecords);
        res.status(201).json({ message: "Salary calculated", salaries: salRecords });
      } else {
        console.log("No new salaries to calculate");
        res.status(200).json({ message: "No new salaries to calculate" });
      }
    } catch (error) {
      console.error("Error in salarycalculation:", error);
      res.status(500).json({ success: false, message: "Error calculating salaries", error: error.message });
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


 