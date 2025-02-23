import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";

exports.salarycalculation = async (res,req)=>{

    try {
        
        const month = req.body.month;
        if(!month){
            return res.status(404).json({success:false, Message:"Select a date"});
        }

        const getAllEmployees =  Employee.find();

        if((!await getAllEmployees).length){
            return res.status(400).json({success:false, Message:"No employees found"});
        }

        const salRecords = [];

        for(let employee of getAllEmployees){

            const overtimepay = employee.overtimeHours * employee.overtimeRate;
            const epf = employee.basicSalary*0.08;//12% kapenawada
            const etf = employee.basicSalary*0.03;
            const netsalary = employee.basicSalary+overtimepay-epf;

            const salary = new Salary({

                employeeId:employee.employeeId,
                basicSalary:employee.basicSalary,
                overtimeHours:employee.overtimeHours,
                epf,
                etf,
                netsalary,
                month,
                isPaid : false


            });

             salRecords.push(salary);

        }

        await Salary.insertMany(salRecords);
        res.status(202).json({Message: "Salary calculated", salaries:salRecords});


    } catch (error) {
        res.status(500).json({Message:"Error calculatig salaries", error});
    }
    

};