import React, { useState, useEffect, useRef } from "react";
import { getCashBookEntrylistbyMonth } from "../services/CashApi";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  TablePagination,
  Snackbar,
  useTheme,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import {
  CalendarToday as CalendarIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Refresh as RefreshIcon,
  MonetizationOn as MoneyIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Event as DateIcon,
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
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

const StyledTableContainer = styled(Paper)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
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
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const TypeChip = styled(Chip)(({ theme, type }) => ({
  borderRadius: '8px',
  fontWeight: 500,
  backgroundColor: type === 'inflow' ? theme.palette.success.light : theme.palette.error.light,
  color: type === 'inflow' ? theme.palette.success.dark : theme.palette.error.dark,
}));

const CashList = () => {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const initialLoadDone = useRef(false);

  const theme = useTheme();

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const fetchEntries = async (selectedMonth, selectedYear) => {
    if (!selectedMonth || !selectedYear) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getCashBookEntrylistbyMonth(selectedMonth, selectedYear);
      setEntries(response.data.data);
    } catch (error) {
      console.error("Error fetching cash book entries:", error);
      setError("Failed to fetch cash book entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    setMonth(currentMonth);
    setYear(currentYear);
  }, []);

  useEffect(() => {
    if (month && year && !initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchEntries(month, year);
    }
  }, [month, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchEntries(month, year);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    fetchEntries(month === 1 ? 12 : month - 1, month === 1 ? year - 1 : year);
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    fetchEntries(month === 12 ? 1 : month + 1, month === 12 ? year + 1 : year);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <StyledCard>
      <CardContent>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <MoneyIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
              }}
            >
              Cash Book Entries
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Previous Month">
                <IconButton onClick={handlePrevMonth}>
                  <PrevIcon />
                </IconButton>
              </Tooltip>

              <StyledTextField
                select
                label="Month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
                sx={{ minWidth: 150 }}
                InputProps={{
                  startAdornment: <CalendarIcon color="action" sx={{ mr: 1 }} />,
                }}
              >
                {months.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </StyledTextField>

              <StyledTextField
                label="Year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                inputProps={{ min: 2000, max: 9999 }}
                sx={{ width: 120 }}
              />

              <Tooltip title="Next Month">
                <IconButton onClick={handleNextMonth}>
                  <NextIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <ActionButton
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            >
              {loading ? "Fetching..." : "Fetch Entries"}
            </ActionButton>
          </Box>
        </Box>

        {error && (
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={handleCloseError}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert severity="error" onClose={handleCloseError} sx={{ borderRadius: '12px' }}>
              {error}
            </Alert>
          </Snackbar>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} thickness={4} />
          </Box>
        ) : entries.length > 0 ? (
          <>
            <StyledTableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Category</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rowsPerPage > 0
                    ? entries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : entries
                  ).map((entry) => (
                    <TableRow key={entry._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DateIcon color="action" />
                          {new Date(entry.date).toLocaleDateString()}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon color="action" />
                          {entry.description}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            color: entry.type === 'inflow'
                              ? theme.palette.success.main
                              : theme.palette.error.main,
                            fontWeight: 600,
                          }}
                        >
                          Rs. {entry.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <TypeChip
                          label={entry.type}
                          type={entry.type}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<CategoryIcon />}
                          label={entry.category}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
            <TablePagination
              component="div"
              count={entries.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: theme.palette.text.secondary,
            }}
          >
            <Typography variant="body1">
              No entries found for the selected period.
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default CashList;