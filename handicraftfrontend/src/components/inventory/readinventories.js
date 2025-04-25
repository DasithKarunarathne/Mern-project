import React from "react";
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import ManagerHeader from '../common/ManagerHeader';

function ReadInventories() {
  return (
    <Box>
      <ManagerHeader 
        title="Inventory Management" 
        breadcrumbs={[
          { label: 'Inventory', path: '/inventory' },
        ]}
      />
      <div>Read Inventories Page</div>
    </Box>
  );
}

export default ReadInventories;
