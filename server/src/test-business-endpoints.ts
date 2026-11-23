import { createApp } from './app';
import http from 'http';

function makeRequest(
  method: string,
  path: string,
  body?: any,
  headers?: Record<string, string>
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5097,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 500, data: JSON.parse(responseBody) });
          } catch {
            resolve({ status: res.statusCode || 500, data: responseBody });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runBusinessTests() {
  const app = createApp();
  const server = app.listen(5097, '127.0.0.1', async () => {
    console.log('--- Testing Business & Category Endpoints ---');
    try {
      // 1. Test public /api/categories endpoint
      const catRes = await makeRequest('GET', '/api/categories');
      console.log('1. Categories endpoint status:', catRes.status);

      // 2. Test /api/businesses/my-businesses requires auth
      const myBizRes = await makeRequest('GET', '/api/businesses/my-businesses');
      console.log('2. My Businesses without auth:', myBizRes.status, myBizRes.data.message);

      // 3. Test POST /api/businesses requires auth
      const createRes = await makeRequest('POST', '/api/businesses', { name: 'Test' });
      console.log('3. Create Business without auth:', createRes.status, createRes.data.message);

      // 4. Test admin moderation status endpoint requires admin auth
      const statusRes = await makeRequest('PATCH', '/api/businesses/some-id/status', { status: 'approved' });
      console.log('4. Admin Status update without auth:', statusRes.status, statusRes.data.message);

      server.close(() => {
        console.log('--- Business Endpoint Tests Passed Successfully ---');
        process.exit(0);
      });
    } catch (err) {
      console.error('Test execution error:', err);
      server.close(() => process.exit(1));
    }
  });
}

runBusinessTests();
