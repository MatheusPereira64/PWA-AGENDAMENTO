import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  apiEnv,
  canConnect,
  devDatabaseUrl,
  spawnDaemon,
  testDatabaseUrl,
  waitForDatabase,
  writeEnvFile,
} from './postgres-lib.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function migrate(databaseUrl) {
  execSync('npx prisma migrate deploy', {
    cwd: path.join(root, 'apps', 'api'),
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  })
}

if (process.env.DATABASE_URL && (process.env.CI === 'true' || process.env.MP_AGENDA_EXTERNAL_DB === 'true')) {
  migrate(process.env.DATABASE_URL)
  process.exit(0)
}

writeEnvFile(path.join(root, 'apps', 'api', '.env'), apiEnv(devDatabaseUrl, 'development'))
writeEnvFile(path.join(root, 'apps', 'api', '.env.test'), apiEnv(testDatabaseUrl, 'test'))
writeEnvFile(path.join(root, 'apps', 'web', '.env'), 'VITE_API_URL=\n')

if (!(await canConnect(devDatabaseUrl))) {
  console.log('Iniciando PostgreSQL embarcado...')
  spawnDaemon()
  await waitForDatabase(devDatabaseUrl)
}

migrate(devDatabaseUrl)
migrate(testDatabaseUrl)

console.log('Bancos prontos.')
