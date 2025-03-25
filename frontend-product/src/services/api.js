import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Add a request interceptor to log headers
axios.interceptors.request.use(
  (config) => {
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', error);
    if (error.response) {  
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

// Product-related API functions
export const getProducts = () => axios.get(`${API_URL}/products`);
export const createProduct = (data) =>
  axios.post(`${API_URL}/products`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getProductById = (id) => axios.get(`${API_URL}/products/${id}`);
export const updateProduct = (id, data) =>
  axios.put(`${API_URL}/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteProduct = (id) => axios.delete(`${API_URL}/products/${id}`);

// Cart-related API functions
export const addToCart = (data) => {
  if (!data.userId) {
    throw new Error('userId is required for addToCart');
  }
  return axios.post(`${API_URL}/cart`, data);
};

export const getCart = (userId) => {
  if (!userId) {
    throw new Error('userId is required for getCart');
  }
  return axios.get(`${API_URL}/cart/user/${userId}`);
};

export const updateCartQuantity = (id, quantity, userId) => {
  if (!userId) {
    throw new Error('userId is required for updateCartQuantity');
  }
  return axios.put(`${API_URL}/cart/${id}`, { quantity, userId });
};

export const removeFromCart = (id, userId) => {
  if (!userId) {
    throw new Error('userId is required for removeFromCart');
  }
  return axios.delete(`${API_URL}/cart/${id}`, { data: { userId } });
};

// Order-related API functions
export const placeOrder = (data) => axios.post(`${API_URL}/orders`, data);
export const getFinancialOverview = () => axios.get(`${API_URL}/orders/financials`);
export const requestRefund = (orderId, refundReason, refundComments) =>
  axios.post(`${API_URL}/orders/${orderId}/request-refund`, { refundReason, refundComments });
export const getUserOrders = (userId) => axios.get(`${API_URL}/orders/user/${userId}`);
export const getOrderById = (orderId) => axios.get(`${API_URL}/orders/${orderId}`);
export const approveRefund = (orderId) =>
  axios.put(`${API_URL}/orders/${orderId}/approve-refund`, null, {
    headers: { 'x-admin-key': 'mock-admin-key' },
  });
export const denyRefund = (orderId) =>
  axios.put(`${API_URL}/orders/${orderId}/deny-refund`, null, {
    headers: { 'x-admin-key': 'mock-admin-key' },
  });
export const getPendingRefunds = () =>
  axios.get(`${API_URL}/orders/pending-refunds`, {
    headers: { 'x-admin-key': 'mock-admin-key' },
  });

// Delivery-related API functions
export const getDeliveryCharge = (postalCode) =>
  axios.get(`${API_URL}/delivery-charges/${postalCode}`);
export const saveDeliveryDetails = (data) => axios.post(`${API_URL}/delivery`, data);

// Email-related API functions
export const sendOtpEmail = (email, name, otp) => axios.post(`${API_URL}/orders/send-otp`, { email, name, otp });