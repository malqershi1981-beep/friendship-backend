const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/orders',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      data.slice(0,10).forEach(o => console.log(o.id, o.customerEmail));
    } catch (e) {
      console.error('PARSE_ERR', e.message);
    }
  });
});
req.on('error', (e) => console.error('REQ_ERR', e.message));
req.end();
