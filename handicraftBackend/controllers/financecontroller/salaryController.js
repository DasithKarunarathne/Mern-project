import Salary from "../../models/financemodel/Salary.js";
import EmployeePayments from "../../models/hrmodels/employeePayments.js";
import CashBook from "../../models/financemodel/CashBook.js";
import Ledger from "../../models/financemodel/Ledger.js";
import CashBalance from "../../models/financemodel/CashBalance.js";
//wenas unadaaaaaaaaaaaaaaa balapan

 

export const salarycalculation = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        const { month } = req.body; // Expected format: "YYYY-MM" (e.g., "2025-03")
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

            // Get overtime pay from the EmployeePayments model
            const totalOvertimePay = employee.totalOvertimePay || 0; // Default to 0 if not provided

            // Calculate EPF (8%) and ETF (3%)
            const epf = employee.basicSalary * 0.08; // 8% of basic salary
            const etf = employee.basicSalary * 0.03; // 3% of basic salary

            // Calculate net salary: basicSalary + totalOvertimePay - epf
            const netSalary = employee.basicSalary + totalOvertimePay - epf;

            // Create a new salary record
            const salary = new Salary({
                employeeId: employee.empID,
                employeeName: employee.empname,
                month,
                basicSalary: employee.basicSalary,
                overtimeHours: employee.totalOvertimeHours || 0, // Default to 0 if not provided
                overtimeRate: employee.overtimeRate || 0, // Default to 0 if not provided
                totalOvertime: totalOvertimePay,
                epf,
                etf,
                netSalary,
                status: "Pending",
                paymentDate: null,
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

        

        // Update salary status
        salary.status = "Completed";
        salary.paymentDate = new Date();
        await salary.save();

        // Update CashBook (outflow for salary payment)
        const cashBookEntry = new CashBook({
            date: new Date(),
            description: `Salary payment for ${salary.employeeName} - ${salary.month}`,
            amount: salary.netSalary,
            type: "outflow",
            category: "salary",
            referenceId: salary._id,
            balance: 0, // Will be updated below
        });

        // Update CashBalance
        const cashBalance = await CashBalance.findOne();
        if (!cashBalance) {
            return res.status(500).json({ message: "Cash balance not initialized" });
        }
        cashBalance.balance -= salary.netSalary;
        cashBalance.lastUpdated = new Date();
        await cashBalance.save();

        cashBookEntry.balance = cashBalance.balance;
        await cashBookEntry.save();

        // Update Ledger
        const ledgerEntry = new Ledger({
            date: new Date(),
            description: `Salary payment for ${salary.employeeName} - ${salary.month}`,
            amount: salary.netSalary,
            category: "Salary",
            source: "Cash Book",
            transactionId: cashBookEntry._id,
            transactiontype: "SalaryPayment",
        });
        await ledgerEntry.save();

        res.status(200).json({ success: true, message: "Salary marked as paid and recorded in financials" });
    } catch (error) {
        console.error("Error marking salary as paid:", error);
        res.status(500).json({ success: false, message: "Error marking salary as paid", error: error.message });
    }
};
 