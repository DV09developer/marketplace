import { createApp } from './app';
import http from 'http';

function makeRequest(
  method: string,
  path: string
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5095,
        path,
        method,
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
    req.end();
  });
}

async function runSearchTests() {
  const app = createApp();
  const server = app.listen(5095, '127.0.0.1', async () => {
    console.log('--- Testing Search API Endpoints ---');
    try {
      // 1. General search endpoint
      const searchRes = await makeRequest('GET', '/api/search');
      console.log('1. General search endpoint status:', searchRes.status);

      // 2. Keyword + city search
      const filteredRes = await makeRequest('GET', '/api/search?keyword=electrical&city=Mumbai');
      console.log('2. Keyword + city search status:', filteredRes.status);

      // 3. Products-only search
      const typeRes = await makeRequest('GET', '/api/search?type=products');
      console.log('3. Products-only search status:', typeRes.status);

      server.close(() => {
        console.log('--- Search Tests Completed Successfully ---');
        process.exit(0);
      });
    } catch (err) {
      console.error('Search test execution error:', err);
      server.close(() => process.exit(1));
    }
  });
}

runSearchTests();
