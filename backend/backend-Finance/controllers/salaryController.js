import Salary from "../models/Salary.js";
import Employee from "../../backend-hr/models/employee.js";
import Overtime from "../../backend-hr/models/overtime.js";
import CashBook from "../models/CashBook.js";
import Ledger from "../models/Ledger.js";
import CashBalance from "../models/CashBalance.js";
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
        const existingSalaries = await Salary.find({ month }) || [];
        console.log(`Found ${existingSalaries.length} existing salaries for month ${month}`);

        // Fetch all employee IDs in batches
        console.log("Fetching all employee IDs...");
        const batchSize = 100; // Fetch 100 employees at a time
        let skip = 0;
        const employeeIDs = [];

        while (true) {
            const batch = await Employee.find({}, { empID: 1 })
                .skip(skip)
                .limit(10)
                .maxTimeMS(8000000); // Increase timeout

            if (batch.length === 0) break; // No more employees to fetch

            employeeIDs.push(...batch.map(emp => emp.empID));
            skip += batchSize;
        }

        console.log("Total employee IDs fetched:", employeeIDs.length);

        if (employeeIDs.length === 0) {
            return res.status(400).json({ success: false, message: "No employees found" });
        }

        const salRecords = [];
        for (let empID of employeeIDs) {
            try {
                // Skip if salary already exists for this employee in this month
                const existingSalary = existingSalaries.find(sal => sal.employeeId === empID);
                if (existingSalary) {
                    console.log(`Salary already calculated for employee ${empID} in ${month}`);
                    continue;
                }

                // Fetch employee details by empID
                console.log(`Fetching employee details for ${empID}...`);
                const employee = await Employee.findOne({ empID }, { empID: 1, empname: 1, basicSalary: 1, overtimeRate: 1, epfPercentage: 1, etfPercentage: 1 }).maxTimeMS(30000); // Increase timeout
                if (!employee) {
                    console.error(`Employee ${empID} not found`);
                    continue; // Skip this employee if not found
                }

                // Fetch overtime record for this employee and month
                console.log(`Fetching overtime for employee ${empID} in ${month}...`);
                const overtimeRecord = await Overtime.findOne({ empID, month }).maxTimeMS(30000); // Increase timeout
                
                // Calculate overtime pay
                const totalOvertimeHours = overtimeRecord ? overtimeRecord.totalOvertimeHours : 0;
                const totalOvertimePay = overtimeRecord ? overtimeRecord.totalOvertimePay : 0;

                // Calculate EPF and ETF based on employee's percentages
                const epf = employee.basicSalary * (employee.epfPercentage / 100);
                const etf = employee.basicSalary * (employee.etfPercentage / 100);

                // Calculate net salary: basicSalary + overtimePay - epf
                const netSalary = employee.basicSalary + totalOvertimePay - epf;

                // Create a new salary record
                const salary = new Salary({
                    employeeId: empID,
                    employeeName: employee.empname,
                    month,
                    basicSalary: employee.basicSalary,
                    overtimeHours: totalOvertimeHours,
                    overtimeRate: employee.overtimeRate,
                    totalOvertime: totalOvertimePay,
                    epf,
                    etf,
                    netSalary,
                    status: "Pending",
                    paymentDate: null,
                });

                salRecords.push(salary);
                console.log(`Salary calculated for ${empID}: Net Salary = ${netSalary}`);
            } catch (error) {
                console.error(`Error processing employee ${empID}:`, error);
                continue; // Skip this employee and continue with the next one
            }
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
