import { deflateSync } from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n += 1) {
  let c = n
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[n] = c
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data])
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  body.copy(out, 4)
  out.writeUInt32BE(crc32(body), 8 + data.length)
  return out
}

function png(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  const center = size / 2
  const radius = size * 0.31
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1)
    raw[row] = 0
    for (let x = 0; x < size; x += 1) {
      const dx = x + 0.5 - center
      const dy = y + 0.5 - center
      const light = dx * dx + dy * dy < radius * radius
      const offset = row + 1 + x * 4
      raw[offset] = light ? 246 : 14
      raw[offset + 1] = light ? 243 : 124
      raw[offset + 2] = light ? 238 : 102
      raw[offset + 3] = 255
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../apps/web/public/icons')
fs.mkdirSync(dir, { recursive: true })
fs.writeFileSync(path.join(dir, 'icon-192.png'), png(192))
fs.writeFileSync(path.join(dir, 'icon-512.png'), png(512))
console.log('ícones gerados')
