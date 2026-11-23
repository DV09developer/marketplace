import { createApp } from './app';
import http from 'http';

const app = createApp();
const testPort = 5099;

const server = app.listen(testPort, '127.0.0.1', () => {
  console.log(`Server listening on http://127.0.0.1:${testPort}`);

  // Test root endpoint
  http.get(`http://127.0.0.1:${testPort}/`, (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      console.log('--- Root Endpoint Response ---');
      console.log('Status:', res.statusCode);
      console.log('Data:', body);

      // Test health endpoint
      http.get(`http://127.0.0.1:${testPort}/api/health`, (healthRes) => {
        let healthBody = '';
        healthRes.on('data', (chunk) => (healthBody += chunk));
        healthRes.on('end', () => {
          console.log('--- Health Endpoint Response ---');
          console.log('Status:', healthRes.statusCode);
          console.log('Data:', healthBody);
          server.close(() => {
            console.log('Test server closed successfully.');
            process.exit(0);
          });
        });
      }).on('error', (err) => {
        console.error('Health endpoint test error:', err);
        server.close(() => process.exit(1));
      });
    });
  }).on('error', (err) => {
    console.error('Root endpoint test error:', err);
    server.close(() => process.exit(1));
  });
});
