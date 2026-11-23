import fs from 'fs';
import path from 'path';
import { pool, checkDatabaseConnection } from '../config/database';

async function runMigrations() {
  console.log('--- Starting Database Migration Runner ---');

  // Verify connection first
  const dbHealth = await checkDatabaseConnection();
  if (!dbHealth.connected) {
    console.error('Migration aborted: Database connection failed.');
    console.error(dbHealth.message);
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    // 1. Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Read all applied migrations
    const { rows: appliedRows } = await client.query<{ version: string }>(
      'SELECT version FROM schema_migrations ORDER BY id ASC'
    );
    const appliedVersions = new Set(appliedRows.map((r) => r.version));

    // 3. Find SQL files
    const migrationsDir = path.resolve(__dirname);
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No SQL migration files found in', migrationsDir);
      return;
    }

    let newlyApplied = 0;

    for (const file of files) {
      if (appliedVersions.has(file)) {
        console.log(`[SKIPPED] ${file} (already applied)`);
        continue;
      }

      console.log(`[APPLYING] ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`[SUCCESS] Applied ${file}`);
        newlyApplied++;
      } catch (migrationErr) {
        await client.query('ROLLBACK');
        console.error(`[FAILED] Error applying ${file}:`, migrationErr);
        throw migrationErr;
      }
    }

    console.log(`--- Migration Finished: ${newlyApplied} migration(s) applied. Total: ${appliedVersions.size + newlyApplied} ---`);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
