import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import EmployeeUpdateForm from "./EmployeeUpdateForm"; // Ensure this file exists

const EmployeeList = ({ refresh }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/employee/");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [refresh]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`http://localhost:5000/api/employee/delete/${id}`);
        fetchEmployees();
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  const handleUpdateClick = (id) => {
    setSelectedEmployeeId(id === selectedEmployeeId ? null : id);
  };

  return (
    <Box>
      <Typography variant="h6">Employee List</Typography>
      {employees.length === 0 ? (
        <Typography>No employees found.</Typography>
      ) : (
        employees.map((employee) => (
          <Card key={employee._id} sx={{ maxWidth: 600, mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">
                  {employee.empname} (ID: {employee.empID})
                </Typography>
                <Box>
                  <IconButton color="primary" onClick={() => handleUpdateClick(employee._id)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(employee._id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
              <Typography color="textSecondary">{employee.role}</Typography>
              <Typography>Salary: ${employee.basicSalary}</Typography>
              <Typography>Overtime: {employee.overtimeHours} hrs @ ${employee.overtimeRate}/hr</Typography>
              {employee.image && (
                <CardMedia component="img" image={employee.image} alt={employee.empname} sx={{ width: 100, mt: 1 }} />
              )}
              {selectedEmployeeId === employee._id && (
                <EmployeeUpdateForm employee={employee} onUpdate={fetchEmployees} onCancel={() => setSelectedEmployeeId(null)} />
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default EmployeeList;
