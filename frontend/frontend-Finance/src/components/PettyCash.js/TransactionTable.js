import React, { useState } from "react";

import UpdateTransactionForm from "./UpdateTransactionForm";
import { deletePettyCash } from "../services/api";
import { Table, TableCell, TableHead, TableRow, TableBody, Button, Dialog, DialogTitle, DialogContent } from "@mui/material";

const TransactionTable = ({ transactions, onUpdate }) => {
    const [open, setOpen] = useState(false); // open/close the dialog
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const handleDelete = async (id) => {
        try {
            await deletePettyCash(id); // calls the deletePettyCash function from the api.js file
            onUpdate(); // refresh the transaction list
        } catch (error) {
            console.error("Error deleting transaction: ", error);
        }
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
                            <TableCell>{transaction.category || '-'}</TableCell>
                            <TableCell>
                                <Button
                                    onClick={() => {
                                        setSelectedTransaction(transaction);
                                        setOpen(true);
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button onClick={() => handleDelete(transaction._id)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Edit Transaction</DialogTitle>
                <DialogContent>
                    <UpdateTransactionForm
                        transaction={selectedTransaction}
                        onUpdate={() => {
                            setOpen(false);
                            onUpdate();
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TransactionTable;