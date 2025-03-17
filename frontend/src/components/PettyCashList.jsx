import { Table, TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,Button, Box } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

const TransactionList=  ({transactions}) =>{

    return(

       <Box sx={{ p: 4, maxWidth: "800px", mx: "auto" }}>
        <h2>Transactions</h2>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {transactions.map((transaction)=>
                    <TableRow key={transaction._id}>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>{transaction.category}</TableCell>

                        <TableCell>
                            <Button
                            component={Link}
                            to={`/update/${transaction._id}`}
                            variant="outlined"
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                            >
                                Edit

                            </Button>

                            <Button
                            component={Link}
                            to={`/delete/${transaction._id}`}
                            variant="outlined"
                            color="error"
                            size="small"
                            >
                                Delete
                            </Button>
                        </TableCell>
                    </TableRow>
                    )}
               
                </TableBody>          
            </Table>
        </TableContainer>
      </Box>
    );
}

export default TransactionList;