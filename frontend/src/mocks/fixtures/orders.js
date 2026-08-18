export const mockOrders = [
  {
    id: 'ord_1',
    userId: 'user_1',
    totalAmount: 2499,
    status: 'DELIVERED',
    paymentMethod: 'RAZORPAY',
    razorpayOrderId: 'rzp_ord_1',
    razorpayPaymentId: 'rzp_pay_1',
    invoiceNumber: 'MK-2026-00001',
    invoiceUrl: 'https://example.com/mock-invoice-1.pdf',
    trackingNumber: 'AWB123456789',
    trackingUrl: 'https://tracking.example.com/AWB123456789',
    shippingAddress: {
      fullName: 'John Doe',
      phone: '9876543210',
      line1: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    isGift: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago (eligible for return)
    items: [
      {
        id: 'item_1',
        productId: 'prod_1',
        product: { name: 'Aurelia Signature Necklace', images: ['https://images.unsplash.com/photo-1599643478524-fb5244dc6eb4?q=80&w=400&auto=format&fit=crop'] },
        quantity: 1,
        priceAtPurchase: 2499
      }
    ],
    returnRequests: []
  },
  {
    id: 'ord_2',
    userId: 'user_1',
    totalAmount: 1299,
    status: 'PACKED',
    paymentMethod: 'COD',
    invoiceNumber: 'MK-2026-00002',
    invoiceUrl: 'https://example.com/mock-invoice-2.pdf',
    trackingNumber: null,
    trackingUrl: null,
    shippingAddress: {
      fullName: 'John Doe',
      phone: '9876543210',
      line1: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    isGift: true,
    giftMessage: 'Happy Birthday!',
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 'item_2',
        productId: 'prod_2',
        product: { name: 'Evil Eye Charm Bracelet', images: ['https://images.unsplash.com/photo-1599643478524-fb5244dc6eb4?q=80&w=400&auto=format&fit=crop'] },
        quantity: 1,
        priceAtPurchase: 1299
      }
    ],
    returnRequests: []
  }
];

export const mockReturns = [
  {
    id: 'ret_1',
    orderId: 'ord_3',
    order: {
      id: 'ord_3',
      totalAmount: 899,
      status: 'DELIVERED',
      paymentMethod: 'RAZORPAY',
      user: { name: 'Jane Smith', email: 'jane@example.com' }
    },
    reason: 'Damaged',
    comment: 'Arrived with a broken clasp',
    status: 'REQUESTED',
    refundAmount: null,
    createdAt: new Date().toISOString()
  }
];
