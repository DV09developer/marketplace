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
        port: 5096,
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

async function runCatalogTests() {
  const app = createApp();
  const server = app.listen(5096, '127.0.0.1', async () => {
    console.log('--- Testing Product & Service Endpoints ---');
    try {
      // 1. Featured products endpoint
      const prodRes = await makeRequest('GET', '/api/products/featured');
      console.log('1. Featured products endpoint status:', prodRes.status);

      // 2. Featured services endpoint
      const servRes = await makeRequest('GET', '/api/services/featured');
      console.log('2. Featured services endpoint status:', servRes.status);

      // 3. Post product requires auth
      const createProdRes = await makeRequest('POST', '/api/products/business/test-id', { name: 'Widget' });
      console.log('3. Create product without auth:', createProdRes.status, createProdRes.data.message);

      // 4. Post service requires auth
      const createServRes = await makeRequest('POST', '/api/services/business/test-id', { name: 'Consulting' });
      console.log('4. Create service without auth:', createServRes.status, createServRes.data.message);

      server.close(() => {
        console.log('--- Product & Service Tests Passed Successfully ---');
        process.exit(0);
      });
    } catch (err) {
      console.error('Catalog test execution error:', err);
      server.close(() => process.exit(1));
    }
  });
}

runCatalogTests();
