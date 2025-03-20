// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const getProducts = () => axios.get(`${API_URL}/products`);
export const createProduct = (data) => axios.post(`${API_URL}/products`, data);
export const getProductById = (id) => axios.get(`${API_URL}/products/${id}`);
export const updateProduct = (id, data) => axios.put(`${API_URL}/products/${id}`, data);
export const deleteProduct = (id) => axios.delete(`${API_URL}/products/${id}`);
export const addToCart = (data) => axios.post(`${API_URL}/cart`, data);
export const getCart = () => axios.get(`${API_URL}/cart`);
export const updateCartQuantity = (id, quantity) => axios.put(`${API_URL}/cart/${id}`, { quantity });
export const removeFromCart = (id) => axios.delete(`${API_URL}/cart/${id}`);
export const placeOrder = (data) => axios.post(`${API_URL}/orders`, data);