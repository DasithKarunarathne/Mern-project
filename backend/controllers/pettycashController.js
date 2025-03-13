import Pettycash from "../models/Pettycash.js";


export const addPettyCash = async(req,res)=>{
        try {
            
            const{description, amount, type,category} = req.body;
            const transaction = new Pettycash({description,amount,type,category});
            await transaction.save();

            //add to ledger part methanta danna

            res.status(201).json({message: 'Transaction Added', transaction});


        } catch (error) {
            res.status(500).json({message:'Error Adding Transaction'});
            console.error(error);
        }
}

export const GetPettyCash =async (req,res)=>{


    try {
        const transactions = await Pettycash.find();
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({message:'Error fetching transactions' });
    }

}