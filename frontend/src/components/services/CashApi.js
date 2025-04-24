import axios from "axios";

const API_URL = 'http://localhost:4000/api/cashbook';

// Define common headers
const headers = {
  "Content-Type": "application/json", // Set the content type to JSON
};

export const addCashBookEntry = (data) =>
    axios.post(`${API_URL}/addCashEntry`, data, { headers });
  

export const getCashBookEntrylistbyMonth = async (month, year) => 
   axios.get(`${API_URL}/getCashBookMonth/${month}/${year}`,{headers});

// Delete Petty Cash by ID
export const deleteCash = (id) =>
    axios.delete(`${API_URL}/deletePettyCash/${id}`, { headers });
  
  // Update Petty Cash by ID
  export const UpdateCash = (id, data) =>
    axios.put(`${API_URL}/updatePettyCash/${id}`, data, { headers });