import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Person,
  Work,
  Phone,
  Home,
  Email,
  AccessTime,
  AttachMoney,
  ArrowBack,
  Edit,
} from "@mui/icons-material";
import ManagerHeader from "../common/ManagerHeader";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const DetailCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(3),
}));

const DetailItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
  },
}));

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/api/employee/${id}`);
        setEmployee(response.data);
      } catch (err) {
        console.error("Error fetching employee details:", err);
        setError("Failed to load employee details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/hr/list")}>
          Back to Employee List
        </Button>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Employee not found.</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/hr/list")}>
          Back to Employee List
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <ManagerHeader
        title="Employee Details"
        breadcrumbs={[
          { label: 'HR', path: '/hr' },
          { label: 'Employee List', path: '/hr/list' },
        ]}
      />
      
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/hr/list")}
            variant="outlined"
          >
            Back to List
          </Button>
          <Button
            startIcon={<Edit />}
            onClick={() => navigate(`/hr/employee/edit/${employee._id}`)}
            variant="contained"
            color="primary"
          >
            Edit Employee
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <DetailCard>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  src={employee.image}
                  alt={employee.empname}
                  sx={{
                    width: 150,
                    height: 150,
                    margin: '0 auto 20px',
                    border: '4px solid',
                    borderColor: 'primary.main',
                  }}
                />
                <Typography variant="h5" gutterBottom>
                  {employee.empname}
                </Typography>
                <Chip label={employee.role} color="primary" />
                <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
                  Employee ID: {employee.empID}
                </Typography>
              </CardContent>
            </DetailCard>
          </Grid>

          <Grid item xs={12} md={8}>
            <DetailCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>Personal Information</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <DetailItem>
                  <Person />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Gender</Typography>
                    <Typography>{employee.gender}</Typography>
                  </Box>
                </DetailItem>

                <DetailItem>
                  <Phone />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Contact Number</Typography>
                    <Typography>{employee.contactNumber}</Typography>
                  </Box>
                </DetailItem>

                <DetailItem>
                  <Home />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                    <Typography>{employee.address}</Typography>
                  </Box>
                </DetailItem>

                <DetailItem>
                  <Phone />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Emergency Contact</Typography>
                    <Typography>{employee.emergencyContact}</Typography>
                  </Box>
                </DetailItem>
              </CardContent>
            </DetailCard>

            <DetailCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>Employment Information</Typography>
                <Divider sx={{ mb: 2 }} />

                <DetailItem>
                  <Work />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Role</Typography>
                    <Typography>{employee.role}</Typography>
                  </Box>
                </DetailItem>

                <DetailItem>
                  <AttachMoney />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Basic Salary</Typography>
                    <Typography>${employee.basicSalary}</Typography>
                  </Box>
                </DetailItem>

                <DetailItem>
                  <AccessTime />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Overtime Rate</Typography>
                    <Typography>${employee.overtimeRate}/hr</Typography>
                  </Box>
                </DetailItem>

                <DetailItem>
                  <AttachMoney />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Total Overtime Pay</Typography>
                    <Typography>${employee.totalOvertimePay}</Typography>
                  </Box>
                </DetailItem>
              </CardContent>
            </DetailCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default EmployeeDetails; 