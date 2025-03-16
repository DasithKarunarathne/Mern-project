import React,{useState} from "react";

import axios from "axios";

const AddTransaction = ({fetchTransactions}) =>{
    const[description, setdescription] = useState("");
    const[amount, setAmount] = useState("");
    const [type, settype] = useState("expense");
    const [category, setCategory] = useState("");
    const [errormsg, setErrormsg]= useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrormsg("");

        try {

            const response = await axios.post("/api/Pettycash//addPettyCash",{
                description,
                amount,
                type,
                category,
            });

            if(response.status===201){
                fetchTransactions();
                setdescription=("");
                setAmount=("");
                settype=("expense");
                setCategory=("");
            }
            
        } catch (error) {
            const msg = error.response?.data?.message || "An unexpeced error occured";
            setErrormsg(msg);
            console.error("Error adding transaction", error);
            
        }
    };

    const closeMdodal  =() => setErrormsg("");
    
    

}
