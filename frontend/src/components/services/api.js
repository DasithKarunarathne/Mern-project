import axios from "axios";

const API_URL = 'http://localhost:4000/api/pettycash'

export const addPettyCash = (data) =>
    axios.post(`{$API_URL}/addPettyCash`,data);

export const getPettyCash = (month,year) =>
    axios.get(`${API_URL}/getPettyCash/${month}/${year}`);

export const deletePettyCash = (id) =>
    axios.delete(`${API_URL}/deletePettyCash/${id}`);

export const updatePettyCash = (id,data) =>
    axios.put(`${API_URL}/updatePettyCash/${id}`,data);