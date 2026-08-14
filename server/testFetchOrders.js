import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testFetchOrders() {
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'lalitpatharia11643@gmail.com',
      password: 'Password123'
    });
    const token = loginRes.data.data.accessToken;

    const res = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`Successfully fetched ${res.data.data.orders.length} orders.`);
  } catch (error) {
    console.error('Error fetching orders:', error.response?.data || error.message);
  }
}

testFetchOrders();
