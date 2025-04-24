import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Fade,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Snackbar,
  TablePagination,
  Chip,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import {
  Book as LedgerIcon,
  CalendarToday as CalendarIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  AccountBalance as AccountIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

const TransactionChip = styled(Chip)(({ theme, type }) => ({
  borderRadius: '8px',
  fontWeight: 500,
  backgroundColor: type === 'credit' ? theme.palette.success.light : theme.palette.error.light,
  color: type === 'credit' ? theme.palette.success.dark : theme.palette.error.dark,
}));

const Ledger = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [ledger, setLedger] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/ledger/fetchLedger/${month}/${year}`);
      setLedger(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching ledger", error);
      setError("Failed to fetch ledger: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add header with styling
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text(`Ledger Report`, 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text(`Period: ${month}/${year}`, 105, 25, { align: 'center' });
    
    // Convert table data to an array of arrays
    const tableData = ledger.map((entry) => [
      new Date(entry.date).toLocaleDateString(),
      entry.description,
      `Rs. ${entry.amount.toLocaleString()}`,
      entry.category,
      entry.source,
      entry.transactionId,
      entry.transactiontype,
    ]);

    // Add the table to the PDF with styling
    autoTable(doc, {
      head: [["Date", "Description", "Amount", "Category", "Source", "Transaction ID", "Type"]],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
      },
    });

    doc.save(`ledger_${month}_${year}.pdf`);
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
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Fade in timeout={500}>
      <DashboardContainer>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link color="inherit" href="/finance/dashboard">
              Dashboard
            </Link>
            <Typography color="primary">Ledger</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <LedgerIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
              }}
            >
              General Ledger
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Previous Month">
              <IconButton onClick={handlePrevMonth}>
                <PrevIcon />
              </IconButton>
            </Tooltip>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <StyledTextField
                type="number"
                label="Month"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                inputProps={{ min: 1, max: 12 }}
                InputProps={{
                  startAdornment: <CalendarIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
              <StyledTextField
                type="number"
                label="Year"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                inputProps={{ min: 2000, max: 2100 }}
              />
            </Box>
            
            <Tooltip title="Next Month">
              <IconButton onClick={handleNextMonth}>
                <NextIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchLedger} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <ActionButton
            variant="contained"
            onClick={downloadPDF}
            startIcon={<DownloadIcon />}
            disabled={loading || ledger.length === 0}
          >
            Download PDF
          </ActionButton>
        </Box>

        {error && (
          <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
            <Alert severity="error" onClose={handleCloseError} sx={{ borderRadius: '12px' }}>
              {error}
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
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Transaction ID</TableCell>
                        <TableCell>Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(rowsPerPage > 0
                        ? ledger.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : ledger
                      ).map((entry) => (
                        <TableRow key={entry._id} hover>
                          <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                color: entry.transactiontype.toLowerCase() === 'credit' 
                                  ? theme.palette.success.main 
                                  : theme.palette.error.main,
                                fontWeight: 600,
                              }}
                            >
                              Rs. {entry.amount.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<AccountIcon />}
                              label={entry.category}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<ReceiptIcon />}
                              label={entry.source}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{entry.transactionId}</TableCell>
                          <TableCell>
                            <TransactionChip
                              icon={<PaymentIcon />}
                              label={entry.transactiontype}
                              type={entry.transactiontype.toLowerCase()}
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
                  count={ledger.length}
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

export default Ledger;