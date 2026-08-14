export const mockUsers = [
  {
    id: 'usr_1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '9876543210',
    joinedAt: '2023-11-15T10:00:00Z',
    orderCount: 5,
    isBlocked: false,
    orders: [
      { id: 'ORD-8923', date: '2023-12-01T10:00:00Z', total: 4500, status: 'DELIVERED' },
      { id: 'ORD-9102', date: '2024-02-14T10:00:00Z', total: 1200, status: 'DELIVERED' }
    ]
  },
  {
    id: 'usr_2',
    name: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    phone: '9988776655',
    joinedAt: '2024-01-20T14:30:00Z',
    orderCount: 1,
    isBlocked: false,
    orders: [
      { id: 'ORD-9881', date: '2024-01-25T14:30:00Z', total: 850, status: 'DELIVERED' }
    ]
  },
  {
    id: 'usr_3',
    name: 'Suspicious User',
    email: 'scammer@fake.com',
    phone: '0000000000',
    joinedAt: '2024-05-10T08:15:00Z',
    orderCount: 0,
    isBlocked: true,
    orders: []
  }
];
