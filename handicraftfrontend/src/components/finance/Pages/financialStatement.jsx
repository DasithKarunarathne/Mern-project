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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  AccountBalance as BalanceIcon,
  TrendingUp as ProfitIcon,
  AccountBalanceWallet as WalletIcon,
  Refresh as RefreshIcon,
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

const StatementSection = styled(Box)(({ theme }) => ({
  '& .MuiListItem-root': {
    borderRadius: theme.spacing(1),
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '& .MuiListItemText-primary': {
    fontWeight: 500,
  },
}));

const ValueText = styled(Typography)(({ theme, type }) => ({
  fontWeight: 600,
  color: type === 'profit' ? theme.palette.success.main :
         type === 'loss' ? theme.palette.error.main :
         theme.palette.text.primary,
}));

function FinancialStatements() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [pl, setPL] = useState({});
  const [sofp, setSOFP] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plResponse, sofpResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/financialStatements/profit-loss', {
          params: { year: selectedYear, month: selectedMonth },
        }),
        axios.get('http://localhost:5000/api/financialStatements/sofp', {
        params: { year: selectedYear, month: selectedMonth },
        })
      ]);
      setPL(plResponse.data);
      setSOFP(sofpResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch financial statements. Please try again.');
    } finally {
      setLoading(false);
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

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (selectedYear === currentYear && selectedMonth >= currentMonth) {
      return;
    }

    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
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
            <Typography color="primary">Financial Statements</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <AssessmentIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
              }}
            >
        Financial Statements
      </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Tooltip title="Previous Month">
            <IconButton onClick={handlePrevMonth}>
              <PrevIcon />
            </IconButton>
          </Tooltip>
          
          <StyledTextField
            type="month"
          label="Select Month"
          value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
          onChange={handleMonthChange}
            InputProps={{
              startAdornment: <CalendarIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          
          <Tooltip title="Next Month">
            <span>
              <IconButton
                onClick={handleNextMonth}
                disabled={
                  selectedYear === new Date().getFullYear() &&
                  selectedMonth >= new Date().getMonth() + 1
                }
              >
                <NextIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
      </Box>

        {error && (
          <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
            <Alert severity="error" onClose={handleCloseError} sx={{ borderRadius: '12px' }}>
              {error}
            </Alert>
          </Snackbar>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} thickness={4} />
          </Box>
        ) : (
          <Grid container spacing={3}>
      {/* Profit & Loss */}
            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <ProfitIcon color="primary" />
                    <Typography variant="h6" component="h2">
                      Profit & Loss Statement
        </Typography>
                  </Box>
                  <StatementSection>
        <List>
          <ListItem>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography>Revenue</Typography>
                              <ValueText>Rs. {(pl.revenue || 0).toLocaleString()}</ValueText>
                            </Box>
                          }
                        />
          </ListItem>
          <Divider />
          <ListItem>
                        <ListItemText primary="Expenses" />
          </ListItem>
          <List sx={{ pl: 4 }}>
            <ListItem>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Salaries</Typography>
                                <ValueText>Rs. {(pl.expenses?.salaries || 0).toLocaleString()}</ValueText>
                              </Box>
                            }
                          />
            </ListItem>
            <ListItem>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Total Expenses</Typography>
                                <ValueText>Rs. {(pl.expenses?.total || 0).toLocaleString()}</ValueText>
                              </Box>
                            }
                          />
            </ListItem>
          </List>
          <Divider />
          <ListItem>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography>Net Profit/Loss</Typography>
                              <ValueText type={pl.netProfit >= 0 ? 'profit' : 'loss'}>
                                Rs. {(pl.netProfit || 0).toLocaleString()}
                              </ValueText>
                            </Box>
                          }
                        />
          </ListItem>
        </List>
                  </StatementSection>
                </CardContent>
              </StyledCard>
            </Grid>

      {/* Statement of Financial Position */}
            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <BalanceIcon color="primary" />
                    <Typography variant="h6" component="h2">
                      Statement of Financial Position
        </Typography>
                  </Box>
                  <StatementSection>
        <List>
          <ListItem>
                        <ListItemText primary="Assets" />
                      </ListItem>
                      <List sx={{ pl: 4 }}>
                        <ListItem>
                          <ListItemText primary="Current Assets" />
                        </ListItem>
                        <List sx={{ pl: 4 }}>
                          <ListItem>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography>Cash</Typography>
                                  <ValueText>Rs. {(sofp.assets?.current?.cash || 0).toLocaleString()}</ValueText>
                                </Box>
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography>Receivables</Typography>
                                  <ValueText>Rs. {(sofp.assets?.current?.receivables || 0).toLocaleString()}</ValueText>
                                </Box>
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography>Total Current Assets</Typography>
                                  <ValueText>Rs. {(sofp.assets?.current?.total || 0).toLocaleString()}</ValueText>
                                </Box>
                              }
                            />
                          </ListItem>
                        </List>
                        <ListItem>
                          <ListItemText primary="Non-Current Assets" />
          </ListItem>
          <List sx={{ pl: 4 }}>
            <ListItem>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography>Long-term Receivables</Typography>
                                  <ValueText>Rs. {(sofp.assets?.nonCurrent?.longTermReceivables || 0).toLocaleString()}</ValueText>
                                </Box>
                              }
                            />
            </ListItem>
            <ListItem>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography>Inventory</Typography>
                                  <ValueText>Rs. {(sofp.assets?.nonCurrent?.inventory || 0).toLocaleString()}</ValueText>
                                </Box>
                              }
                            />
            </ListItem>
            <ListItem>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography>Total Non-Current Assets</Typography>
                                  <ValueText>Rs. {(sofp.assets?.nonCurrent?.total || 0).toLocaleString()}</ValueText>
                                </Box>
                              }
                            />
                          </ListItem>
                        </List>
                        <ListItem>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Total Assets</Typography>
                                <ValueText>Rs. {(sofp.assets?.total || 0).toLocaleString()}</ValueText>
                              </Box>
                            }
                          />
            </ListItem>
          </List>
          <Divider />
          <ListItem>
                        <ListItemText primary="Liabilities" />
                      </ListItem>
                      <List sx={{ pl: 4 }}>
                        <ListItem>
                          <ListItemText primary="Current Liabilities" />
          </ListItem>
          <List sx={{ pl: 4 }}>
            <ListItem>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography>Unpaid Salaries</Typography>
                                  <ValueText>Rs. {(sofp.liabilities?.current?.unpaidSalaries || 0).toLocaleString()}</ValueText>
                                </Box>
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography>Unpaid Orders</Typography>
                                  <ValueText>Rs. {(sofp.liabilities?.current?.unpaidOrders || 0).toLocaleString()}</ValueText>
                                </Box>
                              }
                            />
            </ListItem>
            <ListItem>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography>Total Current Liabilities</Typography>
                                  <ValueText>Rs. {(sofp.liabilities?.current?.total || 0).toLocaleString()}</ValueText>
                                </Box>
                              }
                            />
                          </ListItem>
                        </List>
                        <ListItem>
                          <ListItemText primary="Non-Current Liabilities" />
                        </ListItem>
                        <List sx={{ pl: 4 }}>
                          <ListItem>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography>Total Non-Current Liabilities</Typography>
                                  <ValueText>Rs. {(sofp.liabilities?.nonCurrent?.total || 0).toLocaleString()}</ValueText>
                                </Box>
                              }
                            />
                          </ListItem>
                        </List>
                        <ListItem>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Total Liabilities</Typography>
                                <ValueText>Rs. {(sofp.liabilities?.total || 0).toLocaleString()}</ValueText>
                              </Box>
                            }
                          />
            </ListItem>
          </List>
          <Divider />
          <ListItem>
                        <ListItemText primary="Equity" />
                      </ListItem>
                      <List sx={{ pl: 4 }}>
                        <ListItem>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Initial Capital</Typography>
                                <ValueText>Rs. {(sofp.equity?.initialCapital || 0).toLocaleString()}</ValueText>
                              </Box>
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Accumulated Profit/Loss</Typography>
                                <ValueText type={sofp.equity?.accumulatedProfitLoss >= 0 ? 'profit' : 'loss'}>
                                  Rs. {(sofp.equity?.accumulatedProfitLoss || 0).toLocaleString()}
                                </ValueText>
                              </Box>
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography>Total Equity</Typography>
                                <ValueText>Rs. {(sofp.equity?.total || 0).toLocaleString()}</ValueText>
                              </Box>
                            }
                          />
          </ListItem>
        </List>
                      {sofp.accountingEquationBalanced === false && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          Warning: The accounting equation does not balance. Please check the calculations.
                        </Alert>
                      )}
                    </List>
                  </StatementSection>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        )}
      </DashboardContainer>
    </Fade>
  );
}

export default FinancialStatements;