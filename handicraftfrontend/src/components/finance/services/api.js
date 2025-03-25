import axios from "axios";

const API_URL = "http://localhost:5000/api/pettycash";

const headers = {
  "Content-Type": "application/json",
};

export const addPettyCash = (data) =>
  axios.post(`${API_URL}/addPettyCash`, data, { headers });

export const getPettyCash = (month, year) =>
  axios.get(`${API_URL}/getPettyCash/${month}/${year}`, { headers });

// Adjusted to remove redundant query params since controller uses transaction data
export const deletePettyCash = (id) =>
  axios.delete(`${API_URL}/deletePettyCash/${id}`, { headers });

export const updatePettyCash = (id, data) =>
  axios.put(`${API_URL}/updatePettyCash/${id}`, data, { headers });

export const getSuggestedReimbursement = (month, year) =>
  axios.get(`${API_URL}/suggested-reimbursement?month=${month}&year=${year}`, { headers });