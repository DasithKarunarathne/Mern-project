import { Card, CardContent, Typography } from "@mui/material";
import React from "react";

const BalanceCard = ({ balance }) => { 
    return(

        <Card sx={{mb:2}}>
            <CardContent>
                <Typography variant="h6">Current Balance</Typography>
                <Typography variant="h4" color="primary">
                    ${balance.toFixed(2)}
                </Typography>
            </CardContent>


        </Card>
    )


};
export default BalanceCard;