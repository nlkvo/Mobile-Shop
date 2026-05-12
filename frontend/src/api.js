import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api'
});

export const getProducts = () => API.get('/products');
export const getProduct = (sku) => API.get(`/products/${sku}`);
export const addProduct = (data) => API.post('/products', data);
export const updateProduct = (sku, data) => API.put(`/products/${sku}`, data);
export const deleteProduct = (sku) => API.delete(`/products/${sku}`);

export const getModels = () => API.get('/models');
export const addModel = (data) => API.post('/models', data);

export const getSales = () => API.get('/sales');
export const addSale = (data) => API.post('/sales', data);

export const getArrivals = () => API.get('/arrivals');
export const addArrival = (data) => API.post('/arrivals', data);

export const getWriteoffs = () => API.get('/writeoffs');
export const addWriteoff = (data) => API.post('/writeoffs', data);

export const getShops = () => API.get('/shops');
export const getEmployees = () => API.get('/employees');