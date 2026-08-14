import { http, HttpResponse } from 'msw';
import { mockProducts } from './fixtures/products';
import { mockOrders, mockReturns } from './fixtures/orders';
import { mockUsers } from './fixtures/users';

const API_URL = 'http://localhost:5000/api'; // Mocking against expected backend URL

export const handlers = [
  // -------------------------
  // Auth & 2FA
  // -------------------------
  http.post('http://localhost:5000/api/auth/login', async ({ request }) => {
    const body = await request.json();
    if (body.email === 'admin@aureliajewels.com' && body.password === 'admin123') {
      // Simulate requires 2FA setup first time, or verify if returning
      // We'll mock that it always goes to Setup for demo, unless a specific temp token is passed
      return HttpResponse.json({
        requires2FA: false, // Forces the UI to route to /2fa-setup
        tempToken: 'temp_setup_token_xyz'
      });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.post('http://localhost:5000/api/admin/2fa/setup', async ({ request }) => {
    // Return dummy QR base64 and secret
    return HttpResponse.json({
      success: true,
      data: {
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/AureliaAdmin?secret=JBSWY3DPEHPK3PXP',
        secret: 'JBSWY3DPEHPK3PXP'
      }
    });
  }),

  http.post('http://localhost:5000/api/admin/2fa/verify-setup', async ({ request }) => {
    const body = await request.json();
    if (body.code && body.code.length === 6) {
      return HttpResponse.json({
        success: true,
        token: 'real_admin_access_token',
        backupCodes: [
          '8f7d9a2b', 'c4e510f9', 'a1b2c3d4', 'x9y8z7w6', 'q1w2e3r4',
          'm9n8b7v6', 'u5y6t7r8', 'l0k9j8h7', 'p1o2i3u4', 'zxcvbnma'
        ]
      });
    }
    return HttpResponse.json({ message: 'Invalid code' }, { status: 400 });
  }),

  http.post('http://localhost:5000/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  // -------------------------
  // Dashboard
  // -------------------------
  http.get('http://localhost:5000/api/admin/dashboard/stats', () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalSales: 124500,
        ordersToday: 14,
        pendingReturns: 3,
        lowStockCount: 2,
        pendingReviews: 5,
        revenueChart: [
          { date: 'Mon', revenue: 12000 },
          { date: 'Tue', revenue: 19000 },
          { date: 'Wed', revenue: 15000 },
          { date: 'Thu', revenue: 22000 },
          { date: 'Fri', revenue: 18000 },
          { date: 'Sat', revenue: 34000 },
          { date: 'Sun', revenue: 28000 },
        ]
      }
    });
  }),

  // -------------------------
  // Users / Customers
  // -------------------------
  http.get('http://localhost:5000/api/admin/users', () => {
    return HttpResponse.json({ success: true, data: { users: mockUsers } });
  }),

  // -------------------------
  // Products
  // -------------------------
  http.get(`${API_URL}/products`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    
    let results = [...mockProducts];
    if (q) {
      results = results.filter(p => 
        p.name.toLowerCase().includes(q.toLowerCase()) || 
        p.description.toLowerCase().includes(q.toLowerCase())
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        products: results,
        pagination: { page: 1, limit: 12, total: results.length, totalPages: 1 }
      }
    });
  }),

  http.get(`${API_URL}/products/suggest`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    
    if (!q) return HttpResponse.json({ success: true, data: [] });
    
    const results = mockProducts
      .filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 5)
      .map(p => ({ name: p.name, slug: p.slug, firstImage: p.firstImage }));
      
    return HttpResponse.json({ success: true, data: results });
  }),

  // -------------------------
  // Orders (Customer)
  // -------------------------
  http.get(`${API_URL}/orders`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        orders: mockOrders,
        pagination: { page: 1, limit: 10, total: mockOrders.length, totalPages: 1 }
      }
    });
  }),

  http.get(`${API_URL}/orders/:id`, ({ params }) => {
    const order = mockOrders.find(o => o.id === params.id);
    if (!order) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ success: true, data: order });
  }),

  http.post(`${API_URL}/orders`, async ({ request }) => {
    const body = await request.json();
    if (body.paymentMethod === 'COD') {
      return HttpResponse.json({
        success: true,
        message: 'COD order placed successfully',
        data: { order: { id: 'ord_new_cod', status: 'PACKED' } }
      });
    } else {
      return HttpResponse.json({
        success: true,
        data: { razorpayOrderId: 'rzp_test_123', amount: 2000, dbOrderId: 'ord_new_rzp', key: 'rzp_test_key' }
      });
    }
  }),

  // -------------------------
  // Returns (Customer)
  // -------------------------
  http.post(`${API_URL}/orders/:id/return-request`, async ({ request, params }) => {
    const body = await request.json();
    const newReturn = {
      id: 'ret_new_1',
      orderId: params.id,
      reason: body.reason,
      comment: body.comment,
      status: 'REQUESTED',
      createdAt: new Date().toISOString()
    };
    return HttpResponse.json({ success: true, data: newReturn }, { status: 201 });
  }),

  http.get(`${API_URL}/orders/:id/return-request`, ({ params }) => {
    const ret = mockReturns.find(r => r.orderId === params.id);
    if (!ret) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ success: true, data: ret });
  }),

  // -------------------------
  // Delivery/Pincode
  // -------------------------
  http.get(`${API_URL}/delivery/check`, ({ request }) => {
    const url = new URL(request.url);
    const pincode = url.searchParams.get('pincode');
    
    // Mock 999999 as unserviceable for COD
    if (pincode === '999999') {
      return HttpResponse.json({
        success: true,
        data: { serviceable: true, codAvailable: false, estimatedDays: '5-7 days' }
      });
    }
    
    return HttpResponse.json({
      success: true,
      data: { serviceable: true, codAvailable: true, estimatedDays: '3-5 days' }
    });
  }),

  // -------------------------
  // Admin Endpoints
  // -------------------------
  http.get(`${API_URL}/admin/returns`, () => {
    return HttpResponse.json({
      success: true,
      data: { returns: mockReturns, pagination: { page: 1, limit: 10, total: mockReturns.length, totalPages: 1 } }
    });
  }),

  http.get(`${API_URL}/admin/dashboard/low-stock`, () => {
    const lowStockProducts = mockProducts.filter(p => p.stockQty <= 5);
    return HttpResponse.json({
      success: true,
      data: { products: lowStockProducts, threshold: 5, pagination: { page: 1, limit: 10, total: lowStockProducts.length, totalPages: 1 } }
    });
  })
];
