import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
} from '@mui/material';

function FinancialStatements() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-based
  const [pl, setPL] = useState({});
  const [sofp, setSOFP] = useState({});

  const fetchData = async () => {
    try {
      const plResponse = await axios.get('http://localhost:5000/api/financialStatements/profit-loss', {
        params: { year: selectedYear, month: selectedMonth },
      });
      setPL(plResponse.data);

      const sofpResponse = await axios.get('http://localhost:5000/api/financialStatements/sofp', {
        params: { year: selectedYear, month: selectedMonth },
      });
      setSOFP(sofpResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth]);

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split('-');
    setSelectedYear(parseInt(year));
    setSelectedMonth(parseInt(month));
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', my: 4, p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Financial Statements
      </Typography>

      {/* Month Picker */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <TextField
          label="Select Month"
          type="month"
          value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
          onChange={handleMonthChange}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 200 }}
        />
      </Box>

      {/* Profit & Loss */}
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Profit & Loss ({selectedMonth}/{selectedYear})
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary={`Revenue: Rs.${pl.revenue || 0}`} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Expenses:" />
          </ListItem>
          <List sx={{ pl: 4 }}>
            <ListItem>
              <ListItemText primary={`Salaries: Rs.${pl.expenses?.salaries || 0}`} />
            </ListItem>
            
            <ListItem>
              <ListItemText primary={`Total: Rs.${pl.expenses?.total || 0}`} />
            </ListItem>
          </List>
          <Divider />
          <ListItem>
            <ListItemText primary={`Net Profit: Rs.${pl.netProfit || 0}`} />
          </ListItem>
        </List>
      </Paper>

      {/* Statement of Financial Position */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          SOFP ({selectedMonth}/{selectedYear})
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Assets:" />
          </ListItem>
          <List sx={{ pl: 4 }}>
            <ListItem>
              <ListItemText primary={`Cash: Rs.${sofp.assets?.cash || 0}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Receivables: Rs.${sofp.assets?.receivables || 0}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Total: Rs.${sofp.assets?.total || 0}`} />
            </ListItem>
          </List>
          <Divider />
          <ListItem>
            <ListItemText primary="Liabilities:" />
          </ListItem>
          <List sx={{ pl: 4 }}>
            <ListItem>
              <ListItemText primary={`Unpaid Salaries: Rs.${sofp.liabilities?.unpaidSalaries || 0}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Total: Rs.${sofp.liabilities?.total || 0}`} />
            </ListItem>
          </List>
          <Divider />
          <ListItem>
            <ListItemText primary={`Equity: Rs.${sofp.equity || 0}`} />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
}

export default FinancialStatements;