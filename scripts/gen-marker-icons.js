/**
 * 生成小程序地图标记图标（彩色圆点 PNG，白边），纯 Node 无依赖。
 * 用法: node scripts/gen-marker-icons.js
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const CATEGORIES = {
  playground: "#e07b39",
  indoorplay: "#b8578f",
  park: "#4c9a52",
  library: "#3a6ea5",
  museum: "#8e6bbf",
  zoo: "#2a9d8f",
  beach: "#e5b93c",
  waterplay: "#2f8fd6",
  hiking: "#7a8450",
  camping: "#a9714b",
  farm: "#d1495b",
  themepark: "#c93a86",
};

const SIZE = 36;
const R_OUTER = 16;   // 白边外缘
const R_INNER = 12.5; // 填色内圆

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function makePng(hexColor) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hexColor.slice(i, i + 2), 16));
  const cx = (SIZE - 1) / 2, cy = (SIZE - 1) / 2;
  const rows = [];
  for (let y = 0; y < SIZE; y++) {
    const row = Buffer.alloc(1 + SIZE * 4); // 行首 filter 字节 0
    for (let x = 0; x < SIZE; x++) {
      const d = Math.hypot(x - cx, y - cy);
      const alpha = Math.max(0, Math.min(1, R_OUTER + 0.5 - d));
      const t = Math.max(0, Math.min(1, d - (R_INNER - 0.5))); // 0=填色 1=白边
      const px = Math.round(r + (255 - r) * t);
      const py = Math.round(g + (255 - g) * t);
      const pz = Math.round(b + (255 - b) * t);
      const o = 1 + x * 4;
      row[o] = px; row[o + 1] = py; row[o + 2] = pz; row[o + 3] = Math.round(alpha * 255);
    }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, "..", "miniprogram", "assets", "markers");
fs.mkdirSync(outDir, { recursive: true });
for (const [id, color] of Object.entries(CATEGORIES)) {
  fs.writeFileSync(path.join(outDir, `${id}.png`), makePng(color));
  console.log(`✓ ${id}.png (${color})`);
}
console.log("marker icons written to", outDir);
