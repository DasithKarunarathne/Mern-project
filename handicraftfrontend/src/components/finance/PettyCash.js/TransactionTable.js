import React, { useState } from "react";
import UpdateTransactionForm from "./UpdateTransactionForm";
import { deletePettyCash } from "../services/api";
import { 
  Table, 
  TableCell, 
  TableHead, 
  TableRow, 
  TableBody, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  Alert,
  Snackbar,
  DialogContentText,
  DialogActions
} from "@mui/material";

const TransactionTable = ({ transactions, onUpdate, selectedDate }) => {
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePettyCash(transactionToDelete._id);
      onUpdate();
      setConfirmDelete(false);
      setTransactionToDelete(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error deleting transaction";
      const details = error.response?.data?.details;
      setError({
        message: errorMessage,
        details: details
      });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
    setTransactionToDelete(null);
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction._id}>
              <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{transaction.amount}</TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>{transaction.category}</TableCell>
              <TableCell>
                <Button
                  onClick={() => {
                    setSelectedTransaction(transaction);
                    setOpen(true);
                  }}
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteClick(transaction)}
                  variant="outlined"
                  color="error"
                  size="small"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <UpdateTransactionForm
              transaction={selectedTransaction}
              onUpdate={() => {
                onUpdate();
                setOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={handleCancelDelete}
      >
        <DialogTitle>
          {transactionToDelete?.type === "initial" 
            ? "Warning: Deleting Initial Transaction" 
            : "Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {transactionToDelete?.type === "initial"
              ? "Are you sure you want to delete this initial transaction? This action cannot be undone and may affect other transactions."
              : `Are you sure you want to delete this ${transactionToDelete?.type} transaction?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error?.message}
          {error?.details?.reason && (
            <DialogContentText sx={{ mt: 1, fontSize: '0.875rem' }}>
              {error.details.reason}
            </DialogContentText>
          )}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TransactionTable;