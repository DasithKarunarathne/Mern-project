import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PettyCashDashboard from '../PettyCash.js/PettyCashDashboard';
import BalanceCard from '../PettyCash.js/BalanceCard.jsx';
import CashBookPage from '../cashBook/cashBook.jsx';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  ...(active && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  }),
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.action.hover,
  },
}));

// Enhanced chart data with better styling
const chartData = {
  labels: ['January', 'February', 'March', 'April', 'May'],
  datasets: [
    {
      label: 'Petty Cash Expenses',
      data: [50, 75, 30, 90, 60],
      backgroundColor: 'rgba(94, 53, 177, 0.6)',
      borderColor: 'rgba(94, 53, 177, 1)',
      borderWidth: 2,
      borderRadius: 8,
      hoverBackgroundColor: 'rgba(94, 53, 177, 0.8)',
    },
  ],
};

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
      },
    },
    title: {
      display: true,
      text: 'Monthly Expenses Overview',
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
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  animation: {
    duration: 2000,
    easing: 'easeInOutQuart',
  },
};

export default function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);
  const handleReportsClick = () => setReportsOpen(!reportsOpen);

  const isActiveRoute = (path) => location.pathname === path;

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
          active={isActiveRoute('/finance/dashboard')}
        >
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Overview" />
        </StyledListItem>
        <StyledListItem
          component={Link}
          to="/finance/dashboard/pettycash"
          onClick={handleDrawerClose}
          active={isActiveRoute('/finance/dashboard/pettycash')}
        >
          <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon>
          <ListItemText primary="Petty Cash Management" />
        </StyledListItem>
        <StyledListItem
          component={Link}
          to="/finance/dashboard/salary"
          onClick={handleDrawerClose}
          active={isActiveRoute('/finance/dashboard/salary')}
        >
          <ListItemIcon><CalculateIcon /></ListItemIcon>
          <ListItemText primary="Salary Calculation" />
        </StyledListItem>
        <StyledListItem
          component={Link}
          to="/finance/dashboard/Cashbook"
          onClick={handleDrawerClose}
          active={isActiveRoute('/finance/dashboard/Cashbook')}
        >
          <ListItemIcon><MonetizationOnIcon /></ListItemIcon>
          <ListItemText primary="Cash Book" />
        </StyledListItem>

        <StyledListItem button onClick={handleReportsClick}>
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
                button
                component={Link}
                to={item.path}
                onClick={handleDrawerClose}
                sx={{ pl: 4 }}
                active={isActiveRoute(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </StyledListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </Box>
  );

  const Overview = () => (
    <Fade in timeout={500}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                  <AccountBalanceWalletIcon />
                </Avatar>
                <Typography variant="h6">Total Petty Cash</Typography>
              </Box>
              <BalanceCard />
              <LinearProgress
                variant="determinate"
                value={70}
                sx={{
                  mt: 2,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.primary.light,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              />
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>
                  <CalculateIcon />
                </Avatar>
                <Typography variant="h6">Total Salaries Paid</Typography>
              </Box>
              <Typography variant="h4" sx={{ color: theme.palette.secondary.main }}>
                Rs.N/A
              </Typography>
              <Chip
                label="View Details"
                color="secondary"
                size="small"
                sx={{ mt: 2 }}
                onClick={() => {}}
              />
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Box sx={{ height: 400 }}>
                {chartData && chartOptions ? (
                  <Bar data={chartData} options={chartOptions} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1">Loading chart data...</Typography>
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