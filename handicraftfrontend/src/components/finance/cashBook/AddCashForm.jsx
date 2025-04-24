import React, { useState } from "react";
import { addCashBookEntry } from "../services/CashApi";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  Fade,
  useTheme,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import {
  Description as DescriptionIcon,
  MonetizationOn as AmountIcon,
  Category as CategoryIcon,
  CompareArrows as TypeIcon,
  Save as SaveIcon,
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

const StyledFormControl = styled(FormControl)(({ theme }) => ({
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

const AddCashBookEntryForm = () => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "inflow",
    category: "salary",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const theme = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await addCashBookEntry(formData);
      if (response.data) {
        setSuccess(true);
        setFormData({
          description: "",
          amount: "",
          type: "inflow",
          category: "salary",
        });
      }
    } catch (error) {
      console.error("Error adding cash book entry:", error);
      setError("Failed to add cash book entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  return (
    <Fade in timeout={500}>
      <StyledCard>
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              maxWidth: 500,
              margin: "auto",
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                }}
              >
                New Cash Book Entry
              </Typography>
            </Box>

            <StyledTextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                startAdornment: <DescriptionIcon color="action" sx={{ mr: 1 }} />,
              }}
            />

            <StyledTextField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                startAdornment: <AmountIcon color="action" sx={{ mr: 1 }} />,
              }}
            />

            <StyledFormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Type"
                startAdornment={<TypeIcon color="action" sx={{ mr: 1 }} />}
              >
                <MenuItem value="inflow">Inflow</MenuItem>
                <MenuItem value="outflow">Outflow</MenuItem>
              </Select>
            </StyledFormControl>

            <StyledFormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
                startAdornment={<CategoryIcon color="action" sx={{ mr: 1 }} />}
              >
                <MenuItem value="salary">Salary</MenuItem>
                <MenuItem value="reimbursement">Reimbursement</MenuItem>
                <MenuItem value="order income">Order Income</MenuItem>
                <MenuItem value="pettyCashExcess">Petty Cash Excess</MenuItem>
                <MenuItem value="initial cash">Initial Cash</MenuItem>
              </Select>
            </StyledFormControl>

            <ActionButton
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? "Adding Entry..." : "Add Entry"}
            </ActionButton>
          </Box>

          <Snackbar
            open={success}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity="success"
              sx={{ borderRadius: '12px' }}
            >
              Cash book entry added successfully!
            </Alert>
          </Snackbar>

          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity="error"
              sx={{ borderRadius: '12px' }}
            >
              {error}
            </Alert>
          </Snackbar>
        </CardContent>
      </StyledCard>
    </Fade>
  );
};

export default AddCashBookEntryForm;