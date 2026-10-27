import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import EmbeddedPostgres from 'embedded-postgres'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const PG_PORT = 5433
export const PG_USER = 'postgres'
export const PG_PASSWORD = 'postgres'
export const databaseDir = path.join(root, '.data', 'postgres')
export const pidFile = path.join(root, '.data', 'postgres.pid')

export function databaseUrl(name) {
  return `postgresql://${PG_USER}:${PG_PASSWORD}@127.0.0.1:${PG_PORT}/${name}?schema=public`
}

export const devDatabaseUrl = databaseUrl('mpagenda')
export const testDatabaseUrl = databaseUrl('mpagenda_test')

export async function canConnect(url) {
  const client = new pg.Client({ connectionString: url })
  try {
    await client.connect()
    await client.end()
    return true
  } catch {
    return false
  }
}

export async function ensureDatabases() {
  const client = new pg.Client({
    connectionString: `postgresql://${PG_USER}:${PG_PASSWORD}@127.0.0.1:${PG_PORT}/postgres`,
  })
  await client.connect()
  for (const name of ['mpagenda', 'mpagenda_test']) {
    const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name])
    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE ${name}`)
    }
  }
  await client.end()
}

export async function startEmbeddedPostgres() {
  fs.mkdirSync(databaseDir, { recursive: true })
  const create = (initdbFlags) =>
    new EmbeddedPostgres({
      databaseDir,
      user: PG_USER,
      password: PG_PASSWORD,
      port: PG_PORT,
      persistent: true,
      initdbFlags,
    })

  let embedded = create(['--encoding=UTF8', '--locale=C'])
  if (!fs.existsSync(path.join(databaseDir, 'PG_VERSION'))) {
    try {
      await embedded.initialise()
    } catch (error) {
      fs.rmSync(databaseDir, { recursive: true, force: true })
      fs.mkdirSync(databaseDir, { recursive: true })
      embedded = create(['--encoding=UTF8'])
      await embedded.initialise()
      console.error(error)
    }
  }

  await embedded.start()
  await ensureDatabases()
  return embedded
}

export function spawnDaemon() {
  const child = spawn(process.execPath, [path.join(root, 'scripts', 'postgres-daemon.mjs')], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    cwd: root,
  })
  child.unref()
}

export async function waitForDatabase(url, attempts = 40) {
  for (let index = 0; index < attempts; index += 1) {
    if (await canConnect(url)) return
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`PostgreSQL não respondeu em ${url}`)
}

export function writeEnvFile(filePath, contents) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, contents)
  }
}

export function apiEnv(databaseUrlValue, nodeEnv) {
  return `DATABASE_URL=${databaseUrlValue}
NODE_ENV=${nodeEnv}
PORT=3333
JWT_ACCESS_SECRET=${nodeEnv === 'test' ? 'test-only-access-secret-32chars' : 'dev-only-access-secret-change-me-32'}
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL_DAYS=14
CORS_ORIGIN=http://localhost:5173
APP_URL=http://localhost:5173
COOKIE_SECURE=false
`
}
