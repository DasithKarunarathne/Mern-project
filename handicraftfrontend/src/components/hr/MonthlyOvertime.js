import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
  Chip,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import {
  Add as AddIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { HERITAGE_HANDS_LOGO } from './logo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const ReportContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(4, 'auto'),
  maxWidth: 1200,
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const ReportCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: '2px',
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
}));

const MonthlyOvertime = () => {
  const { year: paramYear, month: paramMonth } = useParams();
  const currentDate = new Date();
  const [year, setYear] = useState(paramYear || currentDate.getFullYear().toString());
  const [month, setMonth] = useState(paramMonth || (currentDate.getMonth() + 1).toString().padStart(2, '0'));
  const [monthlyOvertime, setMonthlyOvertime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchMonthlyOvertime = useCallback(async () => {
    if (!year || !month) {
      setError("Please enter both year and month.");
      return;
    }
    const parsedYear = parseInt(year);
    const parsedMonth = parseInt(month);
    if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      setError("Invalid year or month. Year must be a number, and month must be between 1 and 12.");
      return;
    }

    navigate(`/hr/overtime/monthly/${year}/${month}`);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/employee/overtime/monthly/${year}/${month}`);
      if (response.data.message) {
        setError(response.data.message);
        setMonthlyOvertime([]);
      } else {
        setMonthlyOvertime(response.data);
      }
    } catch (error) {
      console.error("Error fetching monthly overtime:", error);
      setError("Error fetching monthly overtime: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  }, [year, month, navigate]);

  useEffect(() => {
    if (paramYear && paramMonth) fetchMonthlyOvertime();
  }, [paramYear, paramMonth, fetchMonthlyOvertime]);

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toISOString().split("T")[0];
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Define theme colors
    const primaryColor = {
      r: 93,
      g: 64,
      b: 55
    }; // #5D4037 - Deep Brown
    const secondaryColor = {
      r: 255,
      g: 215,
      b: 0
    }; // #FFD700 - Gold

    // Add letterhead border
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setLineWidth(0.5);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Add company logo on the right (smaller size)
    try {
      const logoWidth = 35;
      const logoHeight = 35;
      const logoX = pageWidth - logoWidth - 25;
      const logoY = 20;
      doc.addImage(HERITAGE_HANDS_LOGO, 'PNG', logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }

    // Add company header on the left
    doc.setFontSize(22);
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.text('HERITAGE HANDS', 25, 35);
    
    // Add document title
    doc.setFontSize(16);
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.text('MONTHLY OVERTIME REPORT', pageWidth/2, 60, { align: 'center' });

    // Add horizontal line under the title
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setLineWidth(0.5);
    doc.line(pageWidth/2 - 50, 65, pageWidth/2 + 50, 65);

    // Add reference number and date section
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const refNumber = `REF: HH/OT/${year}/${month.padStart(2, '0')}`;
    doc.text(refNumber, 25, 80);
    
    // Add date information in a more formal format
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = months[parseInt(month) - 1];
    const formattedDate = new Date().toLocaleDateString('en-US', { 
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    doc.text('Date: ' + formattedDate, 25, 87);
    doc.text('Report Period: ' + monthName + ' ' + year, 25, 94);

    // Add a subtle divider before the table
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setLineWidth(0.2);
    doc.line(25, 105, pageWidth - 25, 105);

    // Prepare table data
    const tableData = monthlyOvertime.map((record) => [
      record.empID,
      record.empname,
      record.totalOvertimeHours.toString(),
      `LKR ${record.overtimeRate.toLocaleString()}`,
      `LKR ${record.overtimePay.toLocaleString()}`,
      record.details && record.details.length > 0
        ? record.details
            .map(
              (detail) =>
                `Date: ${formatDate(detail.date)}, Hours: ${detail.overtimeHours}, Pay: LKR ${detail.overtimePay.toLocaleString()}`
            )
            .join("\n")
        : "No details available",
    ]);

    // Add the main table with themed colors
    autoTable(doc, {
      startY: 115,
      head: [
        [
          "Employee ID",
          "Name",
          "Total Hours",
          "Rate (LKR/hr)",
          "Total Pay (LKR)",
          "Details",
        ],
      ],
      body: tableData,
      theme: "grid",
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        lineColor: [primaryColor.r, primaryColor.g, primaryColor.b],
        lineWidth: 0.1,
        font: 'helvetica',
      },
      headStyles: { 
        fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [251, 247, 245],
      },
      bodyStyles: {
        textColor: [primaryColor.r, primaryColor.g, primaryColor.b],
      },
      margin: { left: 25, right: 25 },
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Add footer border
      doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.setLineWidth(0.2);
      doc.line(25, pageHeight - 35, pageWidth - 25, pageHeight - 35);

      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      
      // Left side
      doc.text('Heritage Hands Pvt Ltd.', 25, pageHeight - 25);
      
      // Center
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 25,
        { align: 'center' }
      );
      
      // Right side
      doc.text(
        'CONFIDENTIAL',
        pageWidth - 25,
        pageHeight - 25,
        { align: 'right' }
      );
    }

    doc.save(`Heritage_Hands_Overtime_Report_${year}_${month}.pdf`);
  };

  return (
    <ReportContainer>
      <Stepper activeStep={2} alternativeLabel sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Add Employee</StepLabel>
        </Step>
        <Step>
          <StepLabel>Employee List</StepLabel>
        </Step>
        <Step>
          <StepLabel>Overtime Management</StepLabel>
        </Step>
      </Stepper>

      <Typography
        variant={isMobile ? "h4" : "h3"}
        sx={{
          fontWeight: 700,
          marginBottom: 4,
          textAlign: "center",
          color: theme.palette.primary.main,
        }}
      >
        Monthly Overtime Report
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
        <ActionButton
          variant="contained"
          color="primary"
          onClick={() => navigate("/hr")}
          startIcon={<AddIcon />}
        >
          Add New Employee
        </ActionButton>
        <ActionButton
          variant="contained"
          color="primary"
          onClick={() => navigate("/hr/list")}
          startIcon={<PeopleIcon />}
        >
          Employee List
        </ActionButton>
        <ActionButton
          variant="contained"
          color="primary"
          onClick={() => navigate("/hr/overtime")}
          startIcon={<AccessTimeIcon />}
        >
          Add Overtime
        </ActionButton>
      </Box>

      <ReportCard>
        <CardContent>
          <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <CustomTextField
          label="Year (YYYY)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
                fullWidth
        />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
          label="Month (MM)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <ActionButton
                  variant="contained"
                  color="primary"
                  onClick={fetchMonthlyOvertime}
                  startIcon={<RefreshIcon />}
                  fullWidth
                >
          Fetch Report
                </ActionButton>
                <Tooltip title="Generate PDF Report">
                  <IconButton
          onClick={generatePDF}
                    disabled={loading || monthlyOvertime.length === 0}
          sx={{
                      backgroundColor: theme.palette.warning.main,
                      color: theme.palette.warning.contrastText,
                      '&:hover': {
                        backgroundColor: theme.palette.warning.dark,
                      },
          }}
                  >
                    <PdfIcon />
                  </IconButton>
                </Tooltip>
      </Box>
            </Grid>
          </Grid>

      {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress size={60} thickness={4} />
        </Box>
      )}

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {!loading && !error && monthlyOvertime.length > 0 && (
            <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee ID</TableCell>
                <TableCell>Name</TableCell>
                    <TableCell>Total Hours</TableCell>
                    <TableCell>Rate (LKR/hr)</TableCell>
                    <TableCell>Total Pay (LKR)</TableCell>
                    <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlyOvertime.map((record) => (
                    <TableRow key={record.employeeId} hover>
                  <TableCell>{record.empID}</TableCell>
                  <TableCell>{record.empname}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.totalOvertimeHours}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>LKR {record.overtimeRate.toLocaleString()}</TableCell>
                      <TableCell>LKR {record.overtimePay.toLocaleString()}</TableCell>
                  <TableCell>
                    {record.details && record.details.length > 0 ? (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Hours</TableCell>
                            <TableCell>Pay</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {record.details.map((detail, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(detail.date)}</TableCell>
                              <TableCell>{detail.overtimeHours}</TableCell>
                              <TableCell>LKR {detail.overtimePay.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                          <Typography variant="body2" color="text.secondary">
                            No details available
                          </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
          )}
        </CardContent>
      </ReportCard>
    </ReportContainer>
  );
};

export default MonthlyOvertime;