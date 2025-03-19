import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Adjust to your backend URL

export const getProducts = () => axios.get(`${API_URL}/products`);
export const getProductById = (id) => axios.get(`${API_URL}/products/${id}`);
export const createProduct = (data) => axios.post(`${API_URL}/products`, data);
export const updateProduct = (id, data) => axios.put(`${API_URL}/products/${id}`, data);
export const deleteProduct = (id) => axios.delete(`${API_URL}/products/${id}`);

export const addToCart = (data) => axios.post(`${API_URL}/cart`, data);
export const getCart = () => axios.get(`${API_URL}/cart`);
export const removeFromCart = (id) => axios.delete(`${API_URL}/cart/${id}`);

export const placeOrder = (data) => axios.post(`${API_URL}/orders`, data);