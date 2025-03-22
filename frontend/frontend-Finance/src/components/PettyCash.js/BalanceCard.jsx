import { Card, CardContent, Typography } from "@mui/material";
import React from "react";

const BalanceCard = ({balance}) => { 

    const formattedBalance = typeof balance === "number" ? balance.toFixed(2) : "0.00";


    return(

        <Card sx={{marginBottom:2}}>
            <CardContent>
                <Typography variant="h6">Current Balance</Typography>
                <Typography variant="h4" color="primary">
                    Rs.{formattedBalance}
                </Typography>
            </CardContent>


        </Card>
    )


};
export default BalanceCard;