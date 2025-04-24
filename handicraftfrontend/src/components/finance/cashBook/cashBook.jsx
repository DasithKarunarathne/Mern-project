import React, { useState } from "react";
import { Tabs, Tab, Box, Paper, Typography, Fade, useTheme, useMediaQuery, Breadcrumbs, Link } from "@mui/material";
import { styled } from '@mui/material/styles';
import {
  Book as CashBookIcon,
  Add as AddIcon,
  List as ListIcon,
} from '@mui/icons-material';
import AddCashBookEntryForm from "./AddCashForm";
import CashList from "./CashList";

const DashboardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
  marginBottom: theme.spacing(3),
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  minHeight: 48,
  padding: theme.spacing(1, 3),
  borderRadius: '8px 8px 0 0',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main,
  },
}));

const TabPanel = ({ children, value, index }) => (
  <Fade in={value === index} timeout={500}>
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`cashbook-tabpanel-${index}`}
      aria-labelledby={`cashbook-tab-${index}`}
      sx={{ py: 3 }}
    >
      {value === index && children}
    </Box>
  </Fade>
);

const CashBookPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Fade in timeout={500}>
      <DashboardContainer>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link color="inherit" href="/finance/dashboard">
              Dashboard
            </Link>
            <Typography color="primary">Cash Book</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CashBookIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
              }}
            >
              Cash Book Management
            </Typography>
          </Box>
        </Box>

        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="cash book tabs"
        >
          <StyledTab
            icon={<AddIcon />}
            iconPosition="start"
            label="Add Entry"
            id="cashbook-tab-0"
            aria-controls="cashbook-tabpanel-0"
          />
          <StyledTab
            icon={<ListIcon />}
            iconPosition="start"
            label="View Entries"
            id="cashbook-tab-1"
            aria-controls="cashbook-tabpanel-1"
          />
        </StyledTabs>

        <TabPanel value={tabValue} index={0}>
          <AddCashBookEntryForm />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <CashList />
        </TabPanel>
      </DashboardContainer>
    </Fade>
  );
};

export default CashBookPage;