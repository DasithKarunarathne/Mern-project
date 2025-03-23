import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Salarytable from './SalaryTable.js';
import Ledger from './ledger.jsx';
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalculateIcon from '@mui/icons-material/Calculate';
import DescriptionIcon from '@mui/icons-material/Description';
import BarChartIcon from '@mui/icons-material/BarChart';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
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

// Styled components
const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

// Sample chart data (replace with real data)
const chartData = {
  labels: ['January', 'February', 'March', 'April', 'May'],
  datasets: [
    {
      label: 'Petty Cash Expenses',
      data: [50, 75, 30, 90, 60],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: { legend: { position: 'top' }, title: { display: true, text: 'Monthly Expenses' } },
};

export default function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false); // State for expanding/collapsing Reports

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  const handleReportsClick = () => {
    setReportsOpen(!reportsOpen); // Toggle Reports expansion
  };

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <DrawerHeader />
      <List>
        <ListItem component={Link} to="/finance/dashboard" onClick={handleDrawerClose}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Overview" />
        </ListItem>
        <ListItem component={Link} to="/finance/dashboard/pettycash" onClick={handleDrawerClose}>
          <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon>
          <ListItemText primary="Petty Cash Management" />
        </ListItem>
        <ListItem component={Link} to="/finance/dashboard/salary" onClick={handleDrawerClose}>
          <ListItemIcon><CalculateIcon /></ListItemIcon>
          <ListItemText primary="Salary Calculation" />
        </ListItem>
        <ListItem component={Link} to="/finance/dashboard/Cashbook" onClick={handleDrawerClose}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Cash Book" />
        </ListItem>

        {/* Reports Section */}
        <ListItem button onClick={handleReportsClick}>
          <ListItemIcon><BarChartIcon /></ListItemIcon>
          <ListItemText primary="Reports" />
          {reportsOpen ? <ExpandLess /> : <ExpandMore />} {/* Toggle icon */}
        </ListItem>
        <Collapse in={reportsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={Link}
              to="/finance/dashboard/reports/ledger"
              onClick={handleDrawerClose}
              sx={{ pl: 4 }} // Indent sub-items
            >
              <ListItemIcon><DescriptionIcon /></ListItemIcon>
              <ListItemText primary="Ledger" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/finance/dashboard/reports/invoices"
              onClick={handleDrawerClose}
              sx={{ pl: 4 }} // Indent sub-items
            >
              <ListItemIcon><DescriptionIcon /></ListItemIcon>
              <ListItemText primary="Invoices" />
            </ListItem>
          </List>
        </Collapse>
      </List>
    </Box>
  );

  const Overview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Total Petty Cash</Typography>
          <BalanceCard  />
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Total Salaries Paid</Typography>
          <Typography variant="h4">$12,000</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          {chartData && chartOptions ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Typography variant="body1">Loading chart data...</Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerOpen}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Financial Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Swipeable Sidebar */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerClose}
        onOpen={handleDrawerOpen}
        sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 } }}
      >
        {drawerContent}
      </SwipeableDrawer>

      {/* Main Content */}
      <Main>
        <DrawerHeader />
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/pettycash" element={<PettyCashDashboard />} />
          <Route path="/salary" element={<Salarytable />} />
          <Route path="/Cashbook" element={<CashBookPage />} />
          <Route path="/reports/ledger" element={<Ledger/>} />
          <Route path="/reports/invoices" element={<div>Invoices Report</div>} />
        </Routes>
      </Main>
    </Box>
  );
}