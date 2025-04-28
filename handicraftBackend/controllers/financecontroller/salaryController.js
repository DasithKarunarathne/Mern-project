import Salary from "../../models/financemodel/Salary.js";
import EmployeePayments from "../../models/hrmodels/employeePayments.js";
import CashBook from "../../models/financemodel/CashBook.js";
import Ledger from "../../models/financemodel/Ledger.js";
import CashBalance from "../../models/financemodel/CashBalance.js";
import overtime from "../../models/hrmodels/overtime.js";

export const salarycalculation = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        const { month } = req.body; 
        if (!month) {
            return res.status(400).json({ success: false, message: "Month is required" });
        }

        // Check if salaries already exist for the month
        console.log("Fetching existing salaries for month:", month);
        const existingSalaries = await Salary.find({ month });
        if (existingSalaries.length > 0) {
           const existingEmployeeIDs = new Set(existingSalaries.map(sal => sal.employeeId));
            console.log("Existing employee IDs with salaries:", existingEmployeeIDs);
        } else {
            console.log("No existing salaries found for this month.");
        }



        // Fetch overtime details for the given month
        console.log("Fetching overtime details for month:", month);
        const overtimedetails = await overtime.find({ month });
        console.log("Overtime details fetched:", overtimedetails.length);
        if (overtimedetails.length === 0) {
            console.log("No overtime details found for this month, proceeding with basic salaries.");
        } else {
            // Log the fetched overtime records for debugging
            console.log("Overtime records:", JSON.stringify(overtimedetails, null, 2));
        }

        // Fetch all employee payments
        console.log("Fetching all employee payments...");
        const employeePayments = await EmployeePayments.find().maxTimeMS(80000);
        console.log("Total employee payments fetched:", employeePayments.length);

        if (employeePayments.length === 0) {
            return res.status(400).json({ success: false, message: "No employee payments found" });
        }

        const salRecords = [];
        for (let employee of employeePayments) {
            // Skip if salary already exists for this employee in this month
            const existingSalary = existingSalaries.find(sal => sal.employeeId === employee.empID);
            if (existingSalary) {
                console.log(`Salary already calculated for employee ${employee.empID} in ${month}`);
                continue;
            }

            // Validate empID
            if (!employee.empID) {
                console.error(`Employee ID is missing for employee: ${employee.empname}`);
                continue;
            }

            // Fetch overtime details for this employee using empID
            const overtimeRecord = overtimedetails.find(ot => ot.empID === employee.empID);
            let totalOvertimeHours = 0;
            let totalOvertimePay = 0;
            let overtimeRate = employee.overtimeRate || 0; // Default to 0 if not provided

            if (overtimeRecord) {
                totalOvertimeHours = overtimeRecord.totalOvertimeHours || 0;
                totalOvertimePay = overtimeRecord.totalOvertimePay || 0;
                console.log(`Overtime details found for employee ${employee.empID}: Hours = ${totalOvertimeHours}, Pay = ${totalOvertimePay}`);
            } else {
                console.log(`No overtime details found for employee: ${employee.empID}`);
            }
            


            

            // Get overtime pay from the EmployeePayments model

            // Calculate EPF (8%) and ETF (3%)
            const epf = employee.basicSalary * 0.08; // 8% of basic salary
            const etf = employee.basicSalary * 0.03; // 3% of basic salary
            const epf12 = employee.basicSalary * 0.12; // 12% of basic salary

            // Calculate net salary: basicSalary + totalOvertimePay - epf
            const netSalary = employee.basicSalary + totalOvertimePay - epf;

            // Calculate due date (last day of the month)
            const [year, monthNum] = month.split('-').map(Number);
            const dueDate = new Date(year, monthNum, 0); // Last day of the month

            // Create a new salary record
            const salary = new Salary({
                employeeId: employee.empID, // Ensure empID is assigned to employeeId
                employeeName: employee.empname,
                month,
                basicSalary: employee.basicSalary,
                overtimeHours: totalOvertimeHours , // Default to 0 if not provided
                overtimeRate: totalOvertimePay/totalOvertimeHours || 0, // Default to 0 if not provided
                totalOvertime: totalOvertimePay, // Default to 0 if not provided
                epf,
                etf,
                epf12,
                netSalary,
                status: "Pending",
                paymentDate: null,
                dueDate: dueDate  // Added dueDate
            });

            salRecords.push(salary);
            console.log(`Salary calculated for ${employee.empID}: Net Salary = ${netSalary}`);
        }

        // Save all new salary records
        if (salRecords.length > 0) {
            console.log("Inserting salary records:", salRecords.length);
            await Salary.insertMany(salRecords);
            res.status(201).json({ message: "Salaries calculated", salaries: salRecords });
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




export const markSalPaid = async (req, res) => {
    try {
      const { salaryId } = req.params;
  
      // Find the salary record
      const salary = await Salary.findById(salaryId);
      if (!salary) {
        return res.status(404).json({ message: "Salary record not found" });
      }
  
      // Check the cash balance (query only once)
      const cashBalance = await CashBalance.findOne();
      if (!cashBalance) {
        return res.status(500).json({ message: "Cash balance not initialized" });
      }
  
      // Update salary status and payment date
      salary.status = "Completed";
      salary.paymentDate = new Date();
      // Note: We don't modify dueDate as it represents when the salary was due
      await salary.save();
  
      // Update CashBook (outflow for salary payment)
      const cashBookEntry = new CashBook({
        date: new Date(),
        description: `Salary payment for ${salary.employeeName} - ${salary.month} (Due: ${salary.dueDate.toISOString().split('T')[0]})`,
        amount: salary.netSalary,
        type: "outflow",
        category: "salary",
        referenceId: salary._id,
        balance: 0, // Will be updated below
      });
  
      // Update CashBalance
      cashBalance.balance -= salary.netSalary;
      cashBalance.lastUpdated = new Date();
      await cashBalance.save();
  
      cashBookEntry.balance = cashBalance.balance;
      await cashBookEntry.save();
  
      // Update Ledger
      const ledgerEntry = new Ledger({
        date: new Date(),
        description: `Salary payment for ${salary.employeeName} - ${salary.month} (Due: ${salary.dueDate.toISOString().split('T')[0]})`,
        amount: salary.netSalary,
        category: "Salary",
        source: "Cash Book",
        transactionId: cashBookEntry._id,
        transactiontype: "SalaryPayment",
      });
      await ledgerEntry.save();
  
      res.status(200).json({ 
        success: true, 
        message: "Salary marked as paid and recorded in financials",
        paymentDetails: {
          dueDate: salary.dueDate,
          paymentDate: salary.paymentDate,
          amount: salary.netSalary
        }
      });
    } catch (error) {
      console.error("Error marking salary as paid:", error);
      res.status(500).json({ success: false, message: "Error marking salary as paid", error: error.message });
    }
  };

export const getTotalSalariesPaid = async (req, res) => {
    try {
        const { month, year } = req.query;
        const monthYear = `${year}-${month.toString().padStart(2, '0')}`;

        // Get all completed salary payments for the current month
        const completedSalaries = await Salary.find({
            month: monthYear,
            status: "Completed"
        });

        // Get unique employee IDs from all salary records for this month
        const allSalaries = await Salary.find({ month: monthYear });
        const uniqueEmployeeIds = [...new Set(allSalaries.map(salary => salary.employeeId))];

        // Calculate total paid amount
        const totalPaid = completedSalaries.reduce((sum, salary) => sum + salary.netSalary, 0);

        res.status(200).json({
            success: true,
            totalPaid,
            paidCount: completedSalaries.length,
            totalEmployees: uniqueEmployeeIds.length,
            percentagePaid: uniqueEmployeeIds.length > 0 
                ? ((completedSalaries.length / uniqueEmployeeIds.length) * 100).toFixed(1) 
                : 0
        });
    } catch (error) {
        console.error("Error fetching total salaries paid:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching total salaries paid", 
            error: error.message 
        });
    }
};
