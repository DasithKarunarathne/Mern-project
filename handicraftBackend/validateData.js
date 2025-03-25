import mongoose from "mongoose";
import Employee from "./models/hrmodels/employee.js";
import Overtime from "./models/hrmodels/overtime.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to your MongoDB database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB for validation"));

const validateData = async () => {
  try {
    // Fetch all overtime records
    const overtimeRecords = await Overtime.find();
    console.log(`Found ${overtimeRecords.length} overtime records`);

    // Check each overtime record for a matching employee
    for (const record of overtimeRecords) {
      const employee = await Employee.findById(record.employeeId);
      if (!employee) {
        console.log(`Orphaned overtime record found:`, {
          overtimeId: record._id.toString(),
          employeeId: record.employeeId.toString(),
          empID: record.empID,
          month: record.month
        });

        // Option 1: Delete the orphaned record
        await Overtime.deleteOne({ _id: record._id });
        console.log(`Deleted orphaned overtime record: ${record._id}`);

        // Option 2: (Uncomment to reassign instead of delete)
        /*
        const newEmployee = await Employee.findOne({ empID: record.empID });
        if (newEmployee) {
          record.employeeId = newEmployee._id;
          await record.save();
          console.log(`Reassigned overtime record ${record._id} to employee ${newEmployee._id}`);
        } else {
          console.log(`No matching employee found for empID ${record.empID}. Consider deleting this record.`);
        }
        */
      }
    }

    console.log("Data validation complete.");
  } catch (err) {
    console.error("Error during data validation:", err);
  } finally {
    mongoose.connection.close();
  }
};

validateData();