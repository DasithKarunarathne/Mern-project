import axios from 'axios';

const API_URL = 'http://localhost:5000/api/product';

// Create an axios instance with custom config
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to log headers
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
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
export const getProducts = () => axiosInstance.get('/products');
export const createProduct = (data) =>
  axiosInstance.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getProductById = (id) => axiosInstance.get(`/products/${id}`);
export const updateProduct = (id, data) =>
  axiosInstance.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteProduct = (id) => axiosInstance.delete(`/products/${id}`);

// Cart-related API functions
export const addToCart = (data) => {
  if (!data.userId) {
    throw new Error('userId is required for addToCart');
  }
  return axiosInstance.post('/cart', data);
};

export const getCart = (userId) => {
  if (!userId) {
    throw new Error('userId is required for getCart');
  }
  return axiosInstance.get(`/cart/user/${userId}`);
};

export const updateCartQuantity = (id, quantity, userId) => {
  if (!userId) {
    throw new Error('userId is required for updateCartQuantity');
  }
  return axiosInstance.put(`/cart/${id}`, { quantity, userId });
};

export const removeFromCart = (id, userId) => {
  if (!userId) {
    throw new Error('userId is required for removeFromCart');
  }
  return axiosInstance.delete(`/cart/${id}`, { data: { userId } });
};

// Order-related API functions
export const placeOrder = (data) => axiosInstance.post('/orders', data);
export const getFinancialOverview = () => axiosInstance.get('/orders/financials');
export const requestRefund = (orderId, refundReason, refundComments) =>
  axiosInstance.post(`/orders/${orderId}/request-refund`, { refundReason, refundComments });
export const getUserOrders = (userId) => axiosInstance.get(`/orders/user/${userId}`);
export const getOrderById = (orderId) => axiosInstance.get(`/orders/${orderId}`);
export const approveRefund = (orderId) =>
  axiosInstance.patch(`/orders/${orderId}/approve-refund`, null, {
    headers: { 'x-admin-key': 'mock-admin-key' },
  });
export const denyRefund = (orderId) =>
  axiosInstance.patch(`/orders/${orderId}/deny-refund`, null, {
    headers: { 'x-admin-key': 'mock-admin-key' },
  });
export const getPendingRefunds = () =>
  axiosInstance.get('/orders/pending-refunds', {
    headers: { 'x-admin-key': 'mock-admin-key' },
  });

// Delivery-related API functions
export const getDeliveryCharge = (postalCode) =>
  axiosInstance.get(`/delivery/charge/${postalCode}`);
export const saveDeliveryDetails = (data) => axiosInstance.post('/delivery', data);

// Email-related API functions
export const sendOtpEmail = (email, name, otp) => 
  axiosInstance.post('/orders/send-otp', { email, name, otp });