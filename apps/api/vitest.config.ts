import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { defineConfig } from 'vitest/config'

const root = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(root, '.env.test') })

const databaseUrl =
  process.env.CI === 'true' && process.env.DATABASE_URL
    ? process.env.DATABASE_URL
    : 'postgresql://postgres:postgres@127.0.0.1:5433/mpagenda_test?schema=public'

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    maxWorkers: 1,
    hookTimeout: 40_000,
    testTimeout: 40_000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: databaseUrl,
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'test-only-access-secret-32chars',
      JWT_ACCESS_TTL: '15m',
      JWT_REFRESH_TTL_DAYS: '14',
      CORS_ORIGIN: 'http://localhost:5173',
      APP_URL: 'http://localhost:5173',
      PORT: '3333',
    },
  },
})
