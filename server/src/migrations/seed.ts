import { seedAdminUser } from './seed-admin';
import { pool } from '../config/database';

async function main() {
  console.log('=== Running Database Seeding ===');
  try {
    await seedAdminUser();
    console.log('=== Database Seeding Complete ===');
    process.exit(0);
  } catch (err) {
    console.error('=== Database Seeding Failed ===', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
