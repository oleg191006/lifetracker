/**
 * TypeORM DataSource configuration.
 *
 * Supports two connection modes:
 * 1. DATABASE_URL  — a single connection string (used by Railway, Heroku, etc.)
 *    Format: postgresql://user:password@host:port/database
 * 2. Individual vars — DATABASE_HOST, DATABASE_PORT, etc. (local / Docker)
 *
 * The DATABASE_URL path also enables SSL with `rejectUnauthorized: false`,
 * which is required for Railway's managed PostgreSQL.
 */
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env file — NestJS doesn't do this automatically at the module level.
// In production (Railway) this call is a no-op because env vars are already
// injected by the platform, and there's no .env file on disk.
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Build TypeORM options depending on whether DATABASE_URL is set.
 */
function buildDataSourceOptions(): DataSourceOptions {
  // Entity glob: picks up both .ts files (dev) and compiled .js files (prod).
  const entities = [path.join(__dirname, '..', '**', '*.entity.{ts,js}')];
  const migrations = [path.join(__dirname, 'migrations', '*.{ts,js}')];

  const common = {
    entities,
    migrations,
    // synchronize = true auto-creates/alters tables from entity definitions.
    // NEVER use in production — it can silently drop columns on schema changes.
    synchronize: !isProduction,
    logging: !isProduction,
    // migrationsRun = true tells TypeORM to automatically execute any pending
    // migration files on startup. This is how Railway gets its tables created:
    // 1. App starts → TypeORM connects to Railway PostgreSQL
    // 2. Checks the `migrations` tracking table for already-run migrations
    // 3. Runs any new ones → all tables are created
    migrationsRun: isProduction,
  };

  // Railway (and most cloud providers) supply a full connection string.
  if (process.env.DATABASE_URL) {
    return {
      ...common,
      type: 'postgres',
      url: process.env.DATABASE_URL,
      // Railway's PostgreSQL requires SSL; self-signed certs are used,
      // so we disable strict certificate validation.
      ssl: { rejectUnauthorized: false },
    };
  }

  // Fall back to individual connection parameters (local dev / Docker).
  return {
    ...common,
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'life_tracker',
  };
}

export const dataSourceOptions = buildDataSourceOptions();

/**
 * Default export: DataSource instance for the TypeORM CLI.
 * Used by: npm run migration:generate / migration:run
 */
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
