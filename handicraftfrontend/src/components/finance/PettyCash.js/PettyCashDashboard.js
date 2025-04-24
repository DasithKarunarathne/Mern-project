import React, { useState, useEffect } from "react";
import BalanceCard from "./BalanceCard";
import TransactionTable from "./TransactionTable";
import AddTransactionsForm from "./AddTransactionForm";
import { getPettyCash } from "../services/api";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Card,
  CardContent,
  Grid,
  Fade,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Divider,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import {
  AccountBalanceWallet as WalletIcon,
  CalendarToday as CalendarIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const DashboardContainer = styled(Paper)(({ theme }) => ({
  maxWidth: 1200,
  margin: '2rem auto',
  padding: theme.spacing(3),
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  [theme.breakpoints.down('sm')]: {
    margin: '1rem',
    padding: theme.spacing(2),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const DateNavigator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  borderRadius: '12px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
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

const PettyCashDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedDate, setSelectedDate] = useState(currentMonth);
  const [isCurrentMonth, setIsCurrentMonth] = useState(true);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchTransactions = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const [year, month] = date.split("-");
      const response = await getPettyCash(parseInt(month, 10), parseInt(year, 10));
      setTransactions(response.data.transactions);
      setBalance(response.data.Currentbalance);
      setIsCurrentMonth(date === currentMonth);
    } catch (error) {
      console.error("Error fetching transactions: ", error);
      setError("Failed to fetch transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handlePrevMonth = () => {
    const date = new Date(selectedDate + "-01");
    date.setMonth(date.getMonth() - 1);
    setSelectedDate(date.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const date = new Date(selectedDate + "-01");
    date.setMonth(date.getMonth() + 1);
    const nextMonth = date.toISOString().slice(0, 7);
    if (nextMonth <= currentMonth) {
      setSelectedDate(nextMonth);
    }
  };

  const refreshData = () => {
    fetchTransactions(selectedDate);
  };

  return (
    <Fade in timeout={500}>
      <DashboardContainer>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link color="inherit" href="/finance/dashboard">
              Dashboard
            </Link>
            <Typography color="primary">Petty Cash</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <WalletIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
              }}
            >
              Petty Cash Management
            </Typography>
          </Box>
        </Box>

        <DateNavigator>
          <Tooltip title="Previous Month">
            <IconButton onClick={handlePrevMonth}>
              <PrevIcon />
            </IconButton>
          </Tooltip>
          
          <StyledTextField
            label="Select Month"
            type="month"
            value={selectedDate}
            onChange={handleDateChange}
            InputProps={{
              startAdornment: <CalendarIcon color="action" sx={{ mr: 1 }} />,
            }}
            inputProps={{
              max: currentMonth
            }}
            sx={{ width: 200 }}
          />
          
          <Tooltip title="Next Month">
            <span>
              <IconButton
                onClick={handleNextMonth}
                disabled={selectedDate >= currentMonth}
              >
                <NextIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Refresh Data">
            <IconButton onClick={refreshData} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </DateNavigator>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} thickness={4} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <BalanceCard 
                  balance={balance} 
                  isCurrentMonth={isCurrentMonth}
                />
              </CardContent>
            </StyledCard>
          </Grid>

          {isCurrentMonth && (
            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <AddTransactionsForm 
                    onAdd={() => fetchTransactions(selectedDate)} 
                    selectedDate={selectedDate} 
                  />
                </CardContent>
              </StyledCard>
            </Grid>
          )}

          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <TransactionTable 
                  transactions={transactions} 
                  onUpdate={() => fetchTransactions(selectedDate)}
                  allowEdit={isCurrentMonth} 
                />
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </DashboardContainer>
    </Fade>
  );
};

export default PettyCashDashboard;