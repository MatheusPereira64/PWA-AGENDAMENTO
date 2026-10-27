import fs from 'node:fs'
import { pidFile, startEmbeddedPostgres } from './postgres-lib.mjs'

const embedded = await startEmbeddedPostgres()
fs.mkdirSync(new URL('../.data/', import.meta.url), { recursive: true })
fs.writeFileSync(pidFile, String(process.pid))

const shutdown = async () => {
  fs.rmSync(pidFile, { force: true })
  await embedded.stop()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

console.log('PostgreSQL local em 127.0.0.1:5433 (mpagenda, mpagenda_test)')
setInterval(() => {}, 1 << 30)
