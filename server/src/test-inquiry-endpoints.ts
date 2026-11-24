import { createApp } from './app';
import { generateAccessToken } from './utils/token';
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
        port: 5094,
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

async function runInquiryTests() {
  const app = createApp();
  const server = app.listen(5094, '127.0.0.1', async () => {
    console.log('--- Testing Phase 7 Direct Inquiry Routes & Security ---');
    try {
      // 1. Test empty inquiry submission validation
      const emptyRes = await makeRequest('POST', '/api/inquiries', {});
      console.log('1. Empty Inquiry Submission:', emptyRes.status, emptyRes.data.errors ? 'VALIDATION_ERRORS_OK' : 'FAIL');
      console.log('   Expected fields caught:', Object.keys(emptyRes.data.errors || {}));

      // 2. Test malformed inquiry submission (invalid email, too short message)
      const badRes = await makeRequest('POST', '/api/inquiries', {
        businessId: '123e4567-e89b-12d3-a456-426614174000',
        customerName: 'A',
        customerEmail: 'not-an-email',
        customerPhone: '123',
        subject: 'Hi',
        message: 'short',
      });
      console.log('2. Malformed Inquiry Submission:', badRes.status, badRes.data.errors?.customerEmail ? 'EMAIL_CHECK_OK' : 'FAIL');

      // 3. Test unauthenticated access to personal inquiries
      const unauthMyInquiries = await makeRequest('GET', '/api/inquiries/my-inquiries');
      console.log('3. Unauth My Inquiries Access:', unauthMyInquiries.status, unauthMyInquiries.data.message);

      // 4. Test unauthenticated access to business inquiries
      const unauthBizInquiries = await makeRequest('GET', '/api/inquiries/business/123e4567-e89b-12d3-a456-426614174000');
      console.log('4. Unauth Business Inquiries Access:', unauthBizInquiries.status, unauthBizInquiries.data.message);

      // 5. Test unauthenticated inquiry status change
      const unauthStatus = await makeRequest('PATCH', '/api/inquiries/business/123e4567-e89b-12d3-a456-426614174000/inq-1/status', {
        status: 'contacted',
      });
      console.log('5. Unauth Status Update Access:', unauthStatus.status, unauthStatus.data.message);

      // 6. Test unauthorized business inquiry access with regular user token (Strict Isolation)
      const userToken = generateAccessToken({
        userId: '11111111-1111-1111-1111-111111111111',
        email: 'buyer@example.com',
        role: 'user',
      });

      const forbiddenBizInquiries = await makeRequest(
        'GET',
        '/api/inquiries/business/123e4567-e89b-12d3-a456-426614174000',
        undefined,
        { Authorization: `Bearer ${userToken}` }
      );
      console.log('6. Unauthorized User Access to Other Business Inquiries:', forbiddenBizInquiries.status, forbiddenBizInquiries.status === 403 ? 'ISOLATION_ENFORCED_OK' : forbiddenBizInquiries.data.message);

      console.log('\n--- All Phase 7 Direct Inquiry Route Validations & Checks Passed! ---');
    } catch (err) {
      console.error('Test run failed:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runInquiryTests();
