import bcrypt from 'bcryptjs';
import { pool, checkDatabaseConnection } from '../config/database';
import { env } from '../config/env';

export async function seedAdminUser() {
  console.log('--- Provisioning Initial System Administrator ---');

  const dbHealth = await checkDatabaseConnection();
  if (!dbHealth.connected) {
    console.error('Admin seeding aborted: Database is not connected.');
    console.error(dbHealth.message);
    throw new Error('Database connection failed');
  }

  const client = await pool.connect();

  try {
    const adminEmail = env.INITIAL_ADMIN_EMAIL.toLowerCase().trim();
    const adminName = env.INITIAL_ADMIN_NAME.trim();
    const adminPassword = env.INITIAL_ADMIN_PASSWORD;

    if (!adminPassword || adminPassword.length < 8) {
      throw new Error('INITIAL_ADMIN_PASSWORD must be at least 8 characters long');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    await client.query('BEGIN');

    // 1. Provision into users table as admin role
    const userResult = await client.query(
      `
      INSERT INTO users (full_name, email, password_hash, role, account_status)
      VALUES ($1, $2, $3, 'admin', 'active')
      ON CONFLICT (email) DO UPDATE
      SET
        full_name = EXCLUDED.full_name,
        password_hash = EXCLUDED.password_hash,
        role = 'admin',
        account_status = 'active',
        updated_at = NOW()
      RETURNING id, full_name, email, role;
      `,
      [adminName, adminEmail, passwordHash]
    );

    const userId = userResult.rows[0].id;

    // 2. Provision into dedicated admin_users table
    const adminResult = await client.query(
      `
      INSERT INTO admin_users (user_id, email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, $3, $4, 'superadmin', true)
      ON CONFLICT (email) DO UPDATE
      SET
        user_id = EXCLUDED.user_id,
        password_hash = EXCLUDED.password_hash,
        full_name = EXCLUDED.full_name,
        role = 'superadmin',
        is_active = true,
        updated_at = NOW()
      RETURNING id, email, role, is_active;
      `,
      [userId, adminEmail, passwordHash, adminName]
    );

    await client.query('COMMIT');

    console.log('✅ Admin user provisioned successfully!');
    console.log({
      adminUserId: adminResult.rows[0].id,
      linkedUserId: userId,
      email: adminResult.rows[0].email,
      role: adminResult.rows[0].role,
      active: adminResult.rows[0].is_active,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to seed admin user:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Standalone execution support
if (require.main === module) {
  seedAdminUser()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await pool.end();
      process.exit(1);
    });
}
