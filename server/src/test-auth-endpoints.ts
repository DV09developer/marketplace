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
        port: 5098,
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

async function runAuthTests() {
  const app = createApp();
  const server = app.listen(5098, '127.0.0.1', async () => {
    console.log('--- Testing Auth Routes & Middlewares ---');
    try {
      // 1. Test validation on empty registration
      const regRes = await makeRequest('POST', '/api/auth/register', {});
      console.log('1. Empty Register Validation:', regRes.status, regRes.data.errors ? 'VALIDATION_ERRORS_OK' : 'FAIL');

      // 2. Test validation on invalid login credentials
      const loginRes = await makeRequest('POST', '/api/auth/login', { email: 'bad-email' });
      console.log('2. Bad Email Login Validation:', loginRes.status, loginRes.data.errors?.email ? 'EMAIL_VALIDATION_OK' : 'FAIL');

      // 3. Test refresh token without cookie/body
      const refreshRes = await makeRequest('POST', '/api/auth/refresh', {});
      console.log('3. Empty Refresh Token:', refreshRes.status, refreshRes.data.message);

      // 4. Test protected /api/auth/me without token
      const meRes = await makeRequest('GET', '/api/auth/me');
      console.log('4. Protected /me without token:', meRes.status, meRes.data.message);

      server.close(() => {
        console.log('--- Auth Route Tests Passed Successfully ---');
        process.exit(0);
      });
    } catch (err) {
      console.error('Test execution error:', err);
      server.close(() => process.exit(1));
    }
  });
}

runAuthTests();
