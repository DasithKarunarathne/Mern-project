import axios from "axios";

const API_URL = 'http://localhost:5000/api/pettycash';

// Define common headers
const headers = {
  "Content-Type": "application/json", // Set the content type to JSON
};

// Add Petty Cash
export const addPettyCash = (data) =>
  axios.post(`${API_URL}/addPettyCash`, data, { headers });

// Get Petty Cash for a specific month and year
export const getPettyCash = async (month, year) =>
  axios.get(`${API_URL}/getPettyCash/${month}/${year}`, { headers });

// Delete Petty Cash by ID
export const deletePettyCash = (id) =>
  axios.delete(`${API_URL}/deletePettyCash/${id}`, { headers });

// Update Petty Cash by ID
export const updatePettyCash = (id, data) =>
  axios.put(`${API_URL}/updatePettyCash/${id}`, data, { headers });