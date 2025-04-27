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
import { HERITAGE_HANDS_LOGO } from '../../hr/logo';

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

  const generateReferenceNumber = (transaction) => {
    const date = new Date(transaction.date);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `HH-${year}${month}${day}-${random}`;
  };

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/ledger/fetchLedger/${month}/${year}`);
      // Only generate reference numbers for transactions that don't have one
      const ledgerWithRefs = response.data.map(transaction => {
        if (!transaction.referenceNumber) {
          // If no reference number exists, generate one and update the backend
          const newRefNumber = generateReferenceNumber(transaction);
          // Update the transaction in the backend with the new reference number
          axios.patch(`http://localhost:5000/api/ledger/${transaction._id}/reference`, {
            referenceNumber: newRefNumber
          }).catch(error => {
            console.error("Error updating reference number:", error);
          });
          return { ...transaction, referenceNumber: newRefNumber };
        }
        return transaction;
      });
      setLedger(ledgerWithRefs);
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
    doc.text('GENERAL LEDGER REPORT', pageWidth/2, 60, { align: 'center' });

    // Add horizontal line under the title
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setLineWidth(0.5);
    doc.line(pageWidth/2 - 50, 65, pageWidth/2 + 50, 65);

    // Add reference number and date section
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const refNumber = `REF: HH/GL/${year}/${month.toString().padStart(2, '0')}`;
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

    // Convert table data
    const tableData = ledger.map(entry => [
      new Date(entry.date).toLocaleDateString(),
      entry.description,
      `Rs. ${entry.amount.toLocaleString()}`,
      entry.category,
      entry.source,
      entry.referenceNumber || 'N/A',
      entry.status || 'Completed',
      entry.transactiontype
    ]);

    // Add table with themed colors
    autoTable(doc, {
      startY: 115,
      head: [["Date", "Description", "Amount", "Category", "Source", "Reference Number", "Status", "Type"]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [93, 64, 55],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 1,
        minCellHeight: 10
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [0, 0, 0],
        halign: 'center',
        cellPadding: 1,
        minCellHeight: 8
      },
      columnStyles: {
        0: { cellWidth: 15 }, // Date
        1: { cellWidth: 25 }, // Description
        2: { cellWidth: 18 }, // Amount
        3: { cellWidth: 18 }, // Category
        4: { cellWidth: 18 }, // Source
        5: { cellWidth: 20 }, // Reference Number
        6: { cellWidth: 15 }, // Status
        7: { cellWidth: 15 }  // Type
      },
      margin: { top: 15, right: 15, bottom: 15, left: 15 },
      styles: {
        cellPadding: 1,
        fontSize: 7,
        lineColor: [93, 64, 55],
        lineWidth: 0.1,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      alternateRowStyles: {
        fillColor: [251, 247, 245]
      },
      didDrawPage: function(data) {
        // Add page border
        doc.setDrawColor(93, 64, 55);
        doc.setLineWidth(0.5);
        doc.rect(15, 15, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 30);
        
        // Add page numbers
        doc.setFontSize(8);
        doc.text(
          `Page ${doc.internal.getNumberOfPages()}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 20
        );
      },
      willDrawCell: function(data) {
        // Ensure text wrapping for long content
        if (data.cell.text.length > 0) {
          data.cell.styles.cellWidth = 'wrap';
        }
      }
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

    doc.save(`Heritage_Hands_Ledger_Report_${year}_${month}.pdf`);
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
              <TableCell>Reference Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ledger
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((entry) => (
                <TableRow key={entry._id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>Rs. {entry.amount.toLocaleString()}</TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell>{entry.source}</TableCell>
                  <TableCell>{entry.referenceNumber || 'N/A'}</TableCell>
                  <TableCell>{entry.status || 'Completed'}</TableCell>
                  <TableCell>
                    <TransactionChip
                      label={entry.transactiontype}
                      type={entry.transactiontype}
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