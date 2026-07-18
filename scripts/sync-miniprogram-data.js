/**
 * 将网页版数据 (js/data.js, WGS-84) 同步为小程序数据模块 (GCJ-02)。
 * 微信地图组件使用 GCJ-02 火星坐标系；香港/澳门无偏移，不做转换。
 * 用法: 修改 js/data.js 后运行 node scripts/sync-miniprogram-data.js
 */
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "..", "js", "data.js"), "utf8");
const ACTIVITIES = new Function(src + "; return ACTIVITIES;")();

const PI = Math.PI;
const A = 6378245.0;
const EE = 0.00669342162296594323;

function tLat(x, y) {
  let r = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  r += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  r += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
  r += ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
  return r;
}
function tLng(x, y) {
  let r = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  r += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  r += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
  r += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
  return r;
}
function wgs2gcj(lat, lng) {
  const dLat0 = tLat(lng - 105.0, lat - 35.0);
  const dLng0 = tLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sq = Math.sqrt(magic);
  const dLat = (dLat0 * 180.0) / (((A * (1 - EE)) / (magic * sq)) * PI);
  const dLng = (dLng0 * 180.0) / ((A / sq) * Math.cos(radLat) * PI);
  return [lat + dLat, lng + dLng];
}

const out = ACTIVITIES.map((a, i) => {
  let { lat, lng } = a;
  if (a.city !== "香港" && a.city !== "澳门") [lat, lng] = wgs2gcj(lat, lng);
  return { ...a, lat: +lat.toFixed(6), lng: +lng.toFixed(6), _id: i };
});

const dest = path.join(__dirname, "..", "miniprogram", "data", "activities.js");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(
  dest,
  "// 由 scripts/sync-miniprogram-data.js 自动生成，请勿手改；数据源: js/data.js（坐标已转 GCJ-02）\n" +
    "module.exports = " + JSON.stringify(out) + ";\n"
);
console.log(`✓ ${out.length} entries -> ${dest}`);
