import { checkDatabaseConnection, pool } from './database';

async function main() {
  console.log('Testing PostgreSQL / Supabase connection...');
  const status = await checkDatabaseConnection();
  if (status.connected) {
    console.log('Database Connected Successfully!');
    console.log(status.details);
  } else {
    console.warn('Database Connection Warning:');
    console.warn(status.message);
  }
  await pool.end();
  process.exit(status.connected ? 0 : 1);
}

main().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
