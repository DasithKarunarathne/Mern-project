import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Fade,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Chip,
  Breadcrumbs,
  Link,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import {
  MonetizationOn as MoneyIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  CheckCircle as PaidIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';

const DashboardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const ActionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: '12px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
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

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const Salarytable = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const currentMonthString = `${currentYear}-${currentMonth}`;

  const [month, setMonth] = useState(currentMonthString);
  const [salaries, setSalaries] = useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]);
  const [searchEmpId, setSearchEmpId] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchSalaries = useCallback(async () => {
    if (!month) {
      setError("Please select a month");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/salary/${month}`);
      setSalaries(response.data);
      setFilteredSalaries(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching salaries", error);
      setError("Failed to fetch salaries: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const handleSearch = (e) => {
    const empId = e.target.value;
    setSearchEmpId(empId);
    if (empId.trim() === "") {
      setFilteredSalaries(salaries);
    } else {
      const filtered = salaries.filter((salary) =>
        salary.employeeId.toLowerCase().includes(empId.toLowerCase())
      );
      setFilteredSalaries(filtered);
    }
  };

  const genSalaries = async () => {
    if (!month) {
      setError("Please select a month to generate salaries");
      return;
    }
    
    if (month !== currentMonthString) {
      setError("You can only generate salaries for the current month");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/salary/calculate", { month });
      setSalaries(response.data.salaries || []);
      setFilteredSalaries(response.data.salaries || []);
      setSuccess(response.data.message);
      setError(null);
    } catch (error) {
      console.error("Error generating salaries", error);
      setError("Failed to generate salaries: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const markSalaryPaid = async (salaryId) => {
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/salary/markPaid/${salaryId}`);
      setSuccess("Salary marked as paid");
      setError(null);
      fetchSalaries();
    } catch (error) {
      console.error("Error marking salary as paid", error);
      setError("Failed to mark salary as paid: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePrevMonth = () => {
    const date = new Date(month + "-01");
    date.setMonth(date.getMonth() - 1);
    setMonth(date.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const date = new Date(month + "-01");
    date.setMonth(date.getMonth() + 1);
    const nextMonth = date.toISOString().slice(0, 7);
    if (nextMonth <= currentMonthString) {
      setMonth(nextMonth);
    }
  };

  return (
    <Fade in timeout={500}>
      <DashboardContainer>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link color="inherit" href="/finance/dashboard">
              Dashboard
            </Link>
            <Typography color="primary">Salary Management</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <MoneyIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
              }}
            >
              Salary Management
            </Typography>
          </Box>
        </Box>

        <ActionBar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Previous Month">
              <IconButton onClick={handlePrevMonth}>
                <PrevIcon />
              </IconButton>
            </Tooltip>
            
            <StyledTextField
              type="month"
              label="Select Month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              InputProps={{
                startAdornment: <CalendarIcon color="action" sx={{ mr: 1 }} />,
              }}
              inputProps={{
                max: currentMonthString
              }}
            />
            
            <Tooltip title="Next Month">
              <span>
                <IconButton
                  onClick={handleNextMonth}
                  disabled={month >= currentMonthString}
                >
                  <NextIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <StyledTextField
            label="Search by Employee ID"
            value={searchEmpId}
            onChange={handleSearch}
            placeholder="Enter Employee ID"
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <ActionButton
              variant="contained"
              color="primary"
              onClick={fetchSalaries}
              startIcon={<RefreshIcon />}
              disabled={loading}
            >
              Fetch Salaries
            </ActionButton>
            <ActionButton
              variant="contained"
              color="secondary"
              onClick={genSalaries}
              disabled={month !== currentMonthString || loading}
              startIcon={<MoneyIcon />}
            >
              Generate Salaries
            </ActionButton>
          </Box>
        </ActionBar>

        {error && (
          <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
            <Alert severity="error" onClose={handleCloseSnackbar} sx={{ borderRadius: '12px' }}>
              {error}
            </Alert>
          </Snackbar>
        )}
        {success && (
          <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
            <Alert severity="success" onClose={handleCloseSnackbar} sx={{ borderRadius: '12px' }}>
              {success}
            </Alert>
          </Snackbar>
        )}

        <StyledCard>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress size={40} thickness={4} />
              </Box>
            ) : (
              <>
                <StyledTableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee ID</TableCell>
                        <TableCell>Employee Name</TableCell>
                        <TableCell>Month</TableCell>
                        <TableCell>Basic Salary</TableCell>
                        <TableCell>Overtime Hours</TableCell>
                        <TableCell>Overtime Rate</TableCell>
                        <TableCell>Total Overtime</TableCell>
                        <TableCell>EPF 8%</TableCell>
                        <TableCell>ETF 3%</TableCell>
                        <TableCell>EPF 12%</TableCell>
                        <TableCell>Net Salary</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(rowsPerPage > 0
                        ? filteredSalaries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : filteredSalaries
                      ).map((salary) => (
                        <TableRow key={salary._id} hover>
                          <TableCell>{salary.employeeId}</TableCell>
                          <TableCell>{salary.employeeName}</TableCell>
                          <TableCell>{salary.month}</TableCell>
                          <TableCell>Rs. {salary.basicSalary.toLocaleString()}</TableCell>
                          <TableCell>{salary.overtimeHours || 0}</TableCell>
                          <TableCell>Rs. {(salary.overtimeRate || 0).toLocaleString()}</TableCell>
                          <TableCell>Rs. {salary.totalOvertime.toLocaleString()}</TableCell>
                          <TableCell>Rs. {salary.epf.toLocaleString()}</TableCell>
                          <TableCell>Rs. {salary.etf.toLocaleString()}</TableCell>
                          <TableCell>Rs. {salary.epf12.toLocaleString()}</TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: theme.palette.success.main,
                              }}
                            >
                              Rs. {salary.netSalary.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={salary.status === "Paid" ? <PaidIcon /> : <PendingIcon />}
                              label={salary.status}
                              color={salary.status === "Paid" ? "success" : "warning"}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {salary.status === "Pending" ? (
                              <ActionButton
                                variant="contained"
                                color="primary"
                                onClick={() => markSalaryPaid(salary._id)}
                                disabled={loading}
                                size="small"
                              >
                                Mark as Paid
                              </ActionButton>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Paid on {new Date(salary.paymentDate).toLocaleDateString()}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
                <TablePagination
                  component="div"
                  count={filteredSalaries.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </>
            )}
          </CardContent>
        </StyledCard>
      </DashboardContainer>
    </Fade>
  );
};

export default Salarytable;