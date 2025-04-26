import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import Salarytable from './SalaryTable.js';
import Ledger from './ledger.jsx';
import FinancialStatements from './financialStatement.jsx';
import {
  AppBar,
  Toolbar,
  Typography,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  IconButton,
  Grid,
  Paper,
  Collapse,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  Fade,
  LinearProgress,
  CircularProgress,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalculateIcon from '@mui/icons-material/Calculate';
import DescriptionIcon from '@mui/icons-material/Description';
import BarChartIcon from '@mui/icons-material/BarChart';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PettyCashDashboard from '../PettyCash.js/PettyCashDashboard';
import BalanceCard from '../PettyCash.js/BalanceCard.jsx';
import CashBookPage from '../cashBook/cashBook.jsx';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import GroupIcon from '@mui/icons-material/Group';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const DashboardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  background: theme.palette.background.default,
}));

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  background: theme.palette.background.default,
  transition: 'all 0.3s ease',
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backdropFilter: 'blur(8px)',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: theme.palette.primary.main,
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const StyledListItem = styled(ListItem)(({ theme, $active }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  ...($active && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  }),
  '&:hover': {
    backgroundColor: $active ? theme.palette.primary.dark : theme.palette.action.hover,
  },
}));

// Enhanced chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        padding: 20,
        font: {
          size: 12,
          weight: 500,
        },
        usePointStyle: true,
      },
    },
    title: {
      display: true,
      text: 'Financial Overview',
      font: {
        size: 16,
        weight: 600,
      },
      padding: 20,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        drawBorder: false,
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        callback: (value) => `Rs.${value.toLocaleString()}`,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
  animation: {
    duration: 2000,
    easing: 'easeInOutQuart',
  },
};

// Cash inflow chart options
const cashInflowChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        padding: 20,
        font: {
          size: 12,
          weight: 500,
        },
        usePointStyle: true,
      },
    },
    title: {
      display: true,
      text: 'Monthly Cash Inflows',
      font: {
        size: 16,
        weight: 600,
      },
      padding: 20,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        drawBorder: false,
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        callback: (value) => `Rs.${value.toLocaleString()}`,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
  animation: {
    duration: 2000,
    easing: 'easeInOutQuart',
  },
};

// Update the state variables
export default function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [pettyCashData, setPettyCashData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [monthlyData, setMonthlyData] = useState({ totalIncome: 0, totalExpenses: 0 });
  const [financialData, setFinancialData] = useState({ revenue: 0, expenses: { salaries: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cashInflowData, setCashInflowData] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);
  const handleReportsClick = () => setReportsOpen(!reportsOpen);

  const fetchPettyCashData = async () => {
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const response = await axios.get(`http://localhost:5000/api/pettycash/getPettyCash/${month}/${year}`);
      setPettyCashData(response.data);
    } catch (error) {
      console.error('Error fetching petty cash data:', error);
      setError('Failed to fetch petty cash data');
    }
  };

  const fetchChartData = async () => {
    try {
      const months = [];
      const expenses = [];
      const pettyCashBalances = [];
      const currentDate = new Date();
      
      // Get data for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const response = await axios.get(`http://localhost:5000/api/pettycash/getPettyCash/${month}/${year}`);
        
        // Calculate total expenses and get balance for the month
        const monthlyExpenses = response.data.transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        months.push(new Date(year, month - 1).toLocaleString('default', { month: 'short' }));
        expenses.push(monthlyExpenses);
        pettyCashBalances.push(response.data.Currentbalance || 0);
      }
      
      setChartData({
        labels: months,
        datasets: [
          {
            label: 'Expenses',
            type: 'bar',
            data: expenses,
            backgroundColor: 'rgba(94, 53, 177, 0.6)',
            borderColor: 'rgba(94, 53, 177, 1)',
            borderWidth: 2,
            borderRadius: 8,
            hoverBackgroundColor: 'rgba(94, 53, 177, 0.8)',
            yAxisID: 'y',
          },
          {
            label: 'Petty Cash Balance',
            type: 'line',
            data: pettyCashBalances,
            borderColor: theme.palette.success.main,
            backgroundColor: theme.palette.success.main,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            yAxisID: 'y',
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setError('Failed to fetch chart data');
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const response = await axios.get(`http://localhost:5000/api/cashbook/monthly-summary`, {
        params: { month, year }
      });
      
      if (response.data.success) {
        setMonthlyData({
          totalIncome: response.data.totalIncome,
          totalExpenses: response.data.totalExpenses
        });
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      setError('Failed to fetch monthly summary');
    }
  };

  const fetchFinancialData = async () => {
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const response = await axios.get(`http://localhost:5000/api/financialStatements/profit-loss`, {
        params: { month, year }
      });
      
      if (response.data) {
        setFinancialData(response.data);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError('Failed to fetch financial data');
    }
  };

  // Add new function to fetch cash inflow data
  const fetchCashInflowData = async () => {
    try {
      const months = [];
      const inflows = [];
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      
      // Get data for all months of the current year
      for (let month = 0; month < 12; month++) {
        const monthName = new Date(currentYear, month).toLocaleString('default', { month: 'short' });
        months.push(monthName);
        
        try {
          const response = await axios.get(`http://localhost:5000/api/cashbook/getCashBookMonth/${month + 1}/${currentYear}`);
          
          if (response.data.success) {
            // Calculate total inflows for the month
            const monthlyInflow = response.data.data
              .filter(entry => entry.type === 'inflow')
              .reduce((sum, entry) => sum + entry.amount, 0);
            inflows.push(monthlyInflow);
          } else {
            inflows.push(0);
          }
        } catch (error) {
          console.error(`Error fetching data for ${monthName}:`, error);
          inflows.push(0);
        }
      }
      
      setCashInflowData({
        labels: months,
        datasets: [
          {
            label: 'Cash Inflows',
            data: inflows,
            backgroundColor: 'rgba(76, 175, 80, 0.6)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 2,
            borderRadius: 8,
            hoverBackgroundColor: 'rgba(76, 175, 80, 0.8)',
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching cash inflow data:', error);
      setError('Failed to fetch cash inflow data');
    }
  };

  // Update useEffect to include new data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPettyCashData(),
          fetchChartData(),
          fetchMonthlyData(),
          fetchCashInflowData(),
          fetchFinancialData()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const isActiveRoute = (path) => location.pathname === path;

  const handleLogout = () => {
    window.location.href = 'http://localhost:3000/manager/login';
  };

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <DrawerHeader>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: theme.palette.primary.main,
            margin: '0 auto',
          }}
        >
          <AccountBalanceIcon />
        </Avatar>
      </DrawerHeader>
      <List>
        <StyledListItem
          component={Link}
          to="/finance/dashboard"
          onClick={handleDrawerClose}
          $active={isActiveRoute('/finance/dashboard')}
        >
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Overview" />
        </StyledListItem>
        <StyledListItem
          component={Link}
          to="/finance/dashboard/pettycash"
          onClick={handleDrawerClose}
          $active={isActiveRoute('/finance/dashboard/pettycash')}
        >
          <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon>
          <ListItemText primary="Petty Cash Management" />
        </StyledListItem>
        <StyledListItem
          component={Link}
          to="/finance/dashboard/salary"
          onClick={handleDrawerClose}
          $active={isActiveRoute('/finance/dashboard/salary')}
        >
          <ListItemIcon><CalculateIcon /></ListItemIcon>
          <ListItemText primary="Salary Calculation" />
        </StyledListItem>
        <StyledListItem
          component={Link}
          to="/finance/dashboard/Cashbook"
          onClick={handleDrawerClose}
          $active={isActiveRoute('/finance/dashboard/Cashbook')}
        >
          <ListItemIcon><MonetizationOnIcon /></ListItemIcon>
          <ListItemText primary="Cash Book" />
        </StyledListItem>

        <StyledListItem onClick={handleReportsClick}>
          <ListItemIcon><BarChartIcon /></ListItemIcon>
          <ListItemText primary="Reports" />
          {reportsOpen ? <ExpandLess /> : <ExpandMore />}
        </StyledListItem>
        <Collapse in={reportsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {[
              { path: '/finance/dashboard/reports/ledger', text: 'Ledger', icon: <DescriptionIcon /> },
              { path: '/finance/dashboard/reports/invoices', text: 'Invoices', icon: <DescriptionIcon /> },
              { path: '/finance/dashboard/reports/financial-statements', text: 'Financial Statements', icon: <TrendingUpIcon /> },
            ].map((item) => (
              <StyledListItem
                key={item.path}
                component={Link}
                to={item.path}
                onClick={handleDrawerClose}
                sx={{ pl: 4 }}
                $active={isActiveRoute(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </StyledListItem>
            ))}
          </List>
        </Collapse>
      </List>
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={handleLogout}
          sx={{ mt: 2, borderRadius: '12px', fontWeight: 600 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  const Overview = () => (
    <Fade in timeout={500}>
      <Grid container spacing={3}>
        {/* First row - 3 cards taking one-third width each */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                  <AccountBalanceWalletIcon />
                </Avatar>
                <Typography variant="h6">Total Petty Cash</Typography>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <>
                  <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
                    Rs.{pettyCashData?.Currentbalance?.toLocaleString() || '0'}
                  </Typography>
                  <Chip
                    label="View Details"
                    color="primary"
                    size="small"
                    sx={{ mt: 2 }}
                    component={Link}
                    to="/finance/dashboard/pettycash"
                    clickable
                  />
                </>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 2 }}>
                  <MonetizationOnIcon />
                </Avatar>
                <Typography variant="h6">Monthly Order Income</Typography>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <>
                  <Typography variant="h4" sx={{ color: theme.palette.success.main }}>
                    Rs.{financialData.revenue.toLocaleString()}
                  </Typography>
                  <Chip
                    label="View Details"
                    color="success"
                    size="small"
                    sx={{ mt: 2 }}
                    component={Link}
                    to="/finance/dashboard/reports/financial-statements"
                    clickable
                  />
                </>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>
                  <CalculateIcon />
                </Avatar>
                <Typography variant="h6">Salaries Paid (This Month)</Typography>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <>
                  <Typography variant="h4" sx={{ color: theme.palette.secondary.main }}>
                    Rs.{financialData.expenses?.salaries?.toLocaleString() || '0'}
                  </Typography>
                  <Chip
                    label="View Details"
                    color="secondary"
                    size="small"
                    sx={{ mt: 2 }}
                    component={Link}
                    to="/finance/dashboard/salary"
                    clickable
                  />
                </>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Second row - Cash flow cards */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h6">Cash for the Month</Typography>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <>
                  <Typography variant="h4" sx={{ color: theme.palette.success.main }}>
                    Rs.{monthlyData.totalIncome.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Total cash inflow for current month
                  </Typography>
                  <Chip
                    label="View Details"
                    color="success"
                    size="small"
                    sx={{ mt: 2 }}
                    component={Link}
                    to="/finance/dashboard/Cashbook"
                    clickable
                  />
                </>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.error.main, mr: 2 }}>
                  <TrendingDownIcon />
                </Avatar>
                <Typography variant="h6">Cash Expenses</Typography>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <>
                  <Typography variant="h4" sx={{ color: theme.palette.error.main }}>
                    Rs.{monthlyData.totalExpenses.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Total expenses for current month
                  </Typography>
                  <Chip
                    label="View Details"
                    color="error"
                    size="small"
                    sx={{ mt: 2 }}
                    component={Link}
                    to="/finance/dashboard/Cashbook"
                    clickable
                  />
                </>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Cash Inflow Chart */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Box sx={{ height: 400 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : cashInflowData ? (
                  <Bar data={cashInflowData} options={cashInflowChartOptions} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1">No cash inflow data available</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Existing expense chart */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Box sx={{ height: 450 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : chartData ? (
                  <Bar data={chartData} options={chartOptions} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1">No data available</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Fade>
  );

  return (
    <DashboardContainer>
      <CssBaseline />
      <StyledAppBar position="fixed">
        <Toolbar>
          <MenuButton
            edge="start"
            onClick={handleDrawerOpen}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </MenuButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Financial Dashboard
          </Typography>
        </Toolbar>
      </StyledAppBar>

      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerClose}
        onOpen={handleDrawerOpen}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
            borderRight: 'none',
            boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
          },
        }}
      >
        {drawerContent}
      </SwipeableDrawer>

      <Main>
        <DrawerHeader />
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/pettycash" element={<PettyCashDashboard />} />
          <Route path="/salary" element={<Salarytable />} />
          <Route path="/Cashbook" element={<CashBookPage />} />
          <Route path="/reports/ledger" element={<Ledger/>} />
          <Route path="/reports/invoices" element={<div>Invoices Report</div>} />
          <Route path="/reports/financial-statements" element={<FinancialStatements />} />
        </Routes>
      </Main>
    </DashboardContainer>
  );
}