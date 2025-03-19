import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EmployeeUpdateForm from "./EmployeeUpdateForm";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/employee/");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`http://localhost:4000/api/employee/delete/${id}`);
        alert("Employee Deleted");
        fetchEmployees(); // Refresh list
      } catch (error) {
        console.error(error);
        alert("Error deleting employee: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleUpdateClick = (id) => {
    setSelectedEmployeeId(id === selectedEmployeeId ? null : id); // Toggle update form
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Employee List
      </Typography>
      {employees.length === 0 ? (
        <Typography>No employees found.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {employees.map((employee) => (
            <Card key={employee._id} sx={{ maxWidth: 600 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6">
                    {employee.empname} (ID: {employee.empID})
                  </Typography>
                  <Box>
                    <IconButton color="primary" onClick={() => handleUpdateClick(employee._id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(employee._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography color="textSecondary">{employee.role}</Typography>
                <Typography>
                  Salary: ${employee.basicSalary}, Overtime: {employee.overtimeHours} hrs @ ${employee.overtimeRate}/hr
                </Typography>
                <Typography>EPF: {employee.epfPercentage}%, ETF: {employee.etfPercentage}%</Typography>
                {employee.image && (
                  <CardMedia component="img" image={employee.image} alt={employee.empname} sx={{ width: 100, mt: 1 }} />
                )}
                <Box sx={{ mt: 1 }}>
                  {employee.birthCertificate && (
                    <Button
                      variant="outlined"
                      href={employee.birthCertificate}
                      download={`${employee.empID}_birth_certificate`}
                      sx={{ mr: 1 }}
                    >
                      Birth Certificate
                    </Button>
                  )}
                  {employee.medicalRecords && (
                    <Button
                      variant="outlined"
                      href={employee.medicalRecords}
                      download={`${employee.empID}_medical_records`}
                    >
                      Medical Records
                    </Button>
                  )}
                </Box>
                {selectedEmployeeId === employee._id && (
                  <EmployeeUpdateForm employee={employee} onUpdate={fetchEmployees} onCancel={() => setSelectedEmployeeId(null)} />
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EmployeeList;