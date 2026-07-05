const http = require('http');

const payload = {
  customerName: 'Test User',
  customerPhone: '0912345678',
  customerEmail: 'test@example.com',
  deliveryAddress: 'Test address',
  items: [{ product: { id: 'p1', nameEn: 'A4 Notebook' }, quantity: 1, price: 2.5 }],
  total: 2.5,
  paymentMethod: 'cash',
  status: 'pending',
  isQuotation: false,
};

const data = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('RESPONSE_STATUS', res.statusCode);
    console.log('RESPONSE_BODY', body);
  });
});

req.on('error', (err) => {
  console.error('REQUEST_ERROR', err);
});

req.write(data);
req.end();
