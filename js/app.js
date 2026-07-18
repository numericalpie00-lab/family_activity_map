/* ============ 湾趣地图 · 应用逻辑 ============ */

const CATEGORIES = {
  playground: { label: "游乐场",     emoji: "🎡", color: "#e07b39" },
  indoorplay: { label: "室内乐园",   emoji: "🏰", color: "#b8578f" },
  park:       { label: "公园绿地",   emoji: "🌳", color: "#4c9a52" },
  library:    { label: "图书馆",     emoji: "📚", color: "#3a6ea5" },
  museum:     { label: "博物馆·科普", emoji: "🏛", color: "#8e6bbf" },
  zoo:        { label: "动物·海洋",  emoji: "🦁", color: "#2a9d8f" },
  beach:      { label: "海滩",       emoji: "🏖", color: "#e5b93c" },
  waterplay:  { label: "玩水",       emoji: "💦", color: "#2f8fd6" },
  hiking:     { label: "徒步·自然",  emoji: "⛰", color: "#7a8450" },
  camping:    { label: "露营",       emoji: "⛺", color: "#a9714b" },
  farm:       { label: "采摘农场",   emoji: "🍓", color: "#d1495b" },
  themepark:  { label: "主题乐园",   emoji: "🎢", color: "#c93a86" },
  mall:       { label: "商场亲子",   emoji: "🛍", color: "#4b4bb5" },
};

const CITIES = ["深圳", "广州", "香港", "澳门", "珠海", "佛山", "东莞", "中山", "惠州", "江门", "肇庆"];

// ---------- 状态 ----------
const state = {
  cats: new Set(),     // 空 = 全部
  cities: new Set(),   // 空 = 全部
  conds: new Set(),    // free / indoor / outdoor / toddler
  keyword: "",
  userPos: null,
};

// ---------- 坐标转换 (WGS-84 -> GCJ-02，港澳无偏移不转换) ----------
const GCJ = (() => {
  const PI = Math.PI, A = 6378245.0, EE = 0.00669342162296594323;
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
  return function wgs2gcj(lat, lng) {
    const dLat0 = tLat(lng - 105.0, lat - 35.0);
    const dLng0 = tLng(lng - 105.0, lat - 35.0);
    const radLat = (lat / 180.0) * PI;
    let magic = Math.sin(radLat);
    magic = 1 - EE * magic * magic;
    const sq = Math.sqrt(magic);
    const dLat = (dLat0 * 180.0) / (((A * (1 - EE)) / (magic * sq)) * PI);
    const dLng = (dLng0 * 180.0) / ((A / sq) * Math.cos(radLat) * PI);
    return [lat + dLat, lng + dLng];
  };
})();

const NO_OFFSET_CITIES = new Set(["香港", "澳门"]);
function toGcj(a) {
  return NO_OFFSET_CITIES.has(a.city) ? [a.lat, a.lng] : GCJ(a.lat, a.lng);
}

// ---------- 地图初始化 ----------
const map = L.map("map", { zoomControl: false }).setView([22.75, 113.7], 9);
L.control.zoom({ position: "topright" }).addTo(map);

// 底图：配置了天地图 key 用天地图（WGS-84）；默认用高德中文瓦片（GCJ-02，免 key、内地加载快）。
// DISPLAY_GCJ 表示底图为 GCJ-02 坐标系，此时标记点显示坐标需同步转换以免偏移。
const tdtKey = (typeof MAP_CONFIG !== "undefined" && MAP_CONFIG.tiandituKey) || "";
const DISPLAY_GCJ = !tdtKey;
if (tdtKey) {
  const tdtOpts = {
    subdomains: "01234567",
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.tianditu.gov.cn/">天地图</a> GS(2024)0568号',
  };
  L.tileLayer(`https://t{s}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tdtKey}`, { ...tdtOpts, className: "basemap-muted" }).addTo(map);
  L.tileLayer(`https://t{s}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tdtKey}`, tdtOpts).addTo(map);
} else {
  // className basemap-muted: CSS 滤镜降低底图饱和度，橙色道路退为浅灰，突出地点图标
  L.tileLayer("https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", {
    subdomains: "1234",
    maxZoom: 18,
    attribution: '&copy; 高德地图',
    className: "basemap-muted",
  }).addTo(map);
}

// 每个地点的显示坐标（随底图坐标系而定）
ACTIVITIES.forEach((a) => {
  [a._dlat, a._dlng] = DISPLAY_GCJ ? toGcj(a) : [a.lat, a.lng];
});

const cluster = L.markerClusterGroup({
  showCoverageOnHover: false,
  maxClusterRadius: 46,
  iconCreateFunction: (c) =>
    L.divIcon({
      html: `<div class="cluster-icon" style="width:${c.getChildCount() > 30 ? 44 : 36}px;height:${c.getChildCount() > 30 ? 44 : 36}px;">${c.getChildCount()}</div>`,
      className: "",
      iconSize: [40, 40],
    }),
});
map.addLayer(cluster);

// ---------- 标记 ----------
function makeIcon(cat) {
  const conf = CATEGORIES[cat];
  return L.divIcon({
    html: `<div class="pin" style="background:${conf.color}"><span>${conf.emoji}</span></div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
}

ACTIVITIES.forEach((a, i) => { a._id = i; });

function matchesFilter(a) {
  if (state.cats.size && !state.cats.has(a.c)) return false;
  if (state.cities.size && !state.cities.has(a.city)) return false;
  if (state.conds.has("free") && !a.free) return false;
  if (state.conds.has("indoor") && a.io === "outdoor") return false;
  if (state.conds.has("outdoor") && a.io === "indoor") return false;
  if (state.conds.has("toddler")) {
    const startAge = parseInt(a.age, 10);
    if (isNaN(startAge) || startAge > 3) return false;
  }
  if (state.keyword && !keywordMatch(a, state.keyword)) return false;
  return true;
}

function keywordMatch(a, k) {
  const hay = `${a.n} ${a.city} ${a.d} ${(a.tags || []).join(" ")} ${CATEGORIES[a.c].label}`.toLowerCase();
  return hay.includes(k.toLowerCase());
}

let markerById = {};
function renderMarkers() {
  cluster.clearLayers();
  markerById = {};
  const shown = ACTIVITIES.filter(matchesFilter);
  shown.forEach((a) => {
    const m = L.marker([a._dlat, a._dlng], { icon: makeIcon(a.c) });
    m.on("click", () => showDetail(a));
    markerById[a._id] = m;
    cluster.addLayer(m);
  });
  document.getElementById("result-count").textContent =
    `共找到 ${shown.length} 个地点` + (shown.length ? "，点击地图图标查看详情" : "，试试放宽筛选条件");
  updateCategoryCounts();
  if (!document.getElementById("list-panel").classList.contains("hidden")) renderList();
  return shown;
}

// ---------- 详情卡片 ----------
const detailCard = document.getElementById("detail-card");
function showDetail(a) {
  const conf = CATEGORIES[a.c];
  const q = encodeURIComponent(`${a.city} ${a.n}`);
  const name = encodeURIComponent(a.n);
  const addr = encodeURIComponent(`${a.city} · ${a.addr}`);
  // 高德标点接口要求 GCJ-02 坐标；百度接口用 coord_type=wgs84 声明原始坐标由其自行转换
  const [glat, glng] = toGcj(a);
  const amapUrl = `https://uri.amap.com/marker?position=${glng.toFixed(6)},${glat.toFixed(6)}&name=${name}&src=wanqumap&coordinate=gaode&callnative=0`;
  const baiduUrl = `https://api.map.baidu.com/marker?location=${a.lat},${a.lng}&title=${name}&content=${addr}&output=html&coord_type=wgs84&src=web.wanqumap.gba`;
  const tags = (a.tags || []).map((t) => `<span class="dc-tag">${t}</span>`).join("");
  const seasonTag = a.season ? `<span class="dc-tag warn">🗓 ${a.season}</span>` : "";
  detailCard.innerHTML = `
    <button class="close-btn dc-close" onclick="hideDetail()">×</button>
    <span class="dc-cat" style="background:${conf.color}">${conf.emoji} ${conf.label}</span>
    <h2>${a.n}</h2>
    <p class="dc-desc">${a.d}</p>
    <div class="dc-tags">
      <span class="dc-tag">👶 ${a.age}岁</span>
      <span class="dc-tag">${a.free ? "🆓 免费" : "💰 收费"}</span>
      <span class="dc-tag">${a.io === "indoor" ? "🏠 室内" : a.io === "outdoor" ? "🌤 户外" : "🏠+🌤 室内外"}</span>
      ${seasonTag}${tags}
    </div>
    <p class="dc-meta">📍 ${a.city} · ${a.addr}</p>
    <div class="dc-nav">
      <a href="${amapUrl}" target="_blank" rel="noopener">高德地图</a>
      <a href="${baiduUrl}" target="_blank" rel="noopener">百度地图</a>
      <a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">Google</a>
    </div>`;
  detailCard.classList.remove("hidden");
  positionDetail();
}
function hideDetail() { detailCard.classList.add("hidden"); }
// 桌面端列表打开时，详情卡片左移避开列表面板
function positionDetail() {
  const listOpen = !document.getElementById("list-panel").classList.contains("hidden");
  detailCard.classList.toggle("shifted", listOpen && window.innerWidth > 768);
}

// ---------- 筛选 UI ----------
function updateCategoryCounts() {
  document.querySelectorAll(".cat-chip").forEach((chip) => {
    const cat = chip.dataset.cat;
    const n = ACTIVITIES.filter((a) => {
      const saved = new Set(state.cats);
      state.cats = new Set([cat]);
      const ok = matchesFilter(a);
      state.cats = saved;
      return ok;
    }).length;
    chip.querySelector(".cat-count").textContent = n;
  });
}

function buildFilterUI() {
  const catBox = document.getElementById("category-chips");
  Object.entries(CATEGORIES).forEach(([id, conf]) => {
    const b = document.createElement("button");
    b.className = "chip cat-chip";
    b.dataset.cat = id;
    b.style.borderLeftColor = conf.color;
    b.innerHTML = `${conf.emoji} ${conf.label}<span class="cat-count"></span>`;
    b.onclick = () => {
      state.cats.has(id) ? state.cats.delete(id) : state.cats.add(id);
      b.classList.toggle("active");
      renderMarkers();
    };
    catBox.appendChild(b);
  });

  const cityBox = document.getElementById("city-chips");
  CITIES.forEach((city) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = city;
    b.onclick = () => {
      state.cities.has(city) ? state.cities.delete(city) : state.cities.add(city);
      b.classList.toggle("active");
      renderMarkers();
      zoomToFiltered();
    };
    cityBox.appendChild(b);
  });

  document.querySelectorAll(".cond-chip").forEach((b) => {
    b.onclick = () => {
      const c = b.dataset.cond;
      // 室内 / 户外互斥
      if (c === "indoor" && state.conds.has("outdoor")) {
        state.conds.delete("outdoor");
        document.querySelector('[data-cond="outdoor"]').classList.remove("active");
      }
      if (c === "outdoor" && state.conds.has("indoor")) {
        state.conds.delete("indoor");
        document.querySelector('[data-cond="indoor"]').classList.remove("active");
      }
      state.conds.has(c) ? state.conds.delete(c) : state.conds.add(c);
      b.classList.toggle("active");
      renderMarkers();
    };
  });

  document.getElementById("btn-reset").onclick = () => {
    state.cats.clear();
    state.cities.clear();
    state.conds.clear();
    state.keyword = "";
    document.getElementById("search-input").value = "";
    document.querySelectorAll(".chip.active").forEach((c) => c.classList.remove("active"));
    renderMarkers();
    map.setView([22.75, 113.7], 9);
  };
}

function zoomToFiltered() {
  const shown = ACTIVITIES.filter(matchesFilter);
  if (!shown.length) return;
  const bounds = L.latLngBounds(shown.map((a) => [a._dlat, a._dlng]));
  map.fitBounds(bounds.pad(0.15));
}

// ---------- 图例 ----------
function buildLegend() {
  document.getElementById("legend").innerHTML = Object.values(CATEGORIES)
    .map((c) => `<span class="lg-item"><span class="lg-dot" style="background:${c.color}"></span>${c.label}</span>`)
    .join("");
}

// ---------- 搜索 ----------
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

searchInput.addEventListener("input", () => {
  const k = searchInput.value.trim();
  state.keyword = k;
  renderMarkers();
  if (!k) { searchResults.classList.add("hidden"); return; }
  // 搜索下拉为全局搜索，不受侧栏筛选限制
  const hits = ACTIVITIES.filter((a) => keywordMatch(a, k)).slice(0, 8);
  searchResults.innerHTML = hits.length
    ? hits.map((a) => `<div class="sr-item" data-id="${a._id}">${CATEGORIES[a.c].emoji} ${a.n}<span class="sr-city">${a.city}</span></div>`).join("")
    : `<div class="sr-empty">没有找到「${k}」，试试别的关键词？</div>`;
  searchResults.classList.remove("hidden");
  searchResults.querySelectorAll(".sr-item").forEach((el) => {
    el.onclick = () => {
      const a = ACTIVITIES[+el.dataset.id];
      searchResults.classList.add("hidden");
      map.setView([a._dlat, a._dlng], 14);
      showDetail(a);
    };
  });
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".searchbox")) searchResults.classList.add("hidden");
});

// ---------- 附近 ----------
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

let userMarker = null;
document.getElementById("btn-locate").onclick = () => {
  if (!navigator.geolocation) { alert("当前浏览器不支持定位"); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.userPos = [pos.coords.latitude, pos.coords.longitude]; // WGS-84，用于算距离
      // 底图为 GCJ-02 时显示位置需转换（港澳范围内无偏移）
      const inHkMo =
        pos.coords.longitude > 113.5 && pos.coords.longitude < 114.45 &&
        pos.coords.latitude > 22.06 && pos.coords.latitude < 22.57 &&
        !(pos.coords.longitude < 113.75 && pos.coords.latitude > 22.24);
      const dispPos = DISPLAY_GCJ && !inHkMo
        ? GCJ(pos.coords.latitude, pos.coords.longitude)
        : state.userPos;
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.circleMarker(dispPos, {
        radius: 9, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1,
      }).addTo(map).bindTooltip("我的位置");
      map.setView(dispPos, 12);
      openList("📍 离我最近");
    },
    () => alert("定位失败，请允许浏览器获取位置权限。\n提示：部分浏览器要求 HTTPS 才能定位。"),
    { enableHighAccuracy: true, timeout: 8000 }
  );
};

// ---------- 列表视图 ----------
const listPanel = document.getElementById("list-panel");
function openList(title) {
  document.getElementById("list-title").textContent = title || "全部地点";
  listPanel.classList.remove("hidden");
  renderList();
}
function renderList() {
  let shown = ACTIVITIES.filter(matchesFilter);
  if (state.userPos) {
    shown = shown
      .map((a) => ({ ...a, _dist: haversine(state.userPos[0], state.userPos[1], a.lat, a.lng) }))
      .sort((x, y) => x._dist - y._dist);
  }
  document.getElementById("list-body").innerHTML = shown.length
    ? shown.map((a) => `
      <div class="list-item" data-id="${a._id}">
        <div class="li-top">
          <span>${CATEGORIES[a.c].emoji}</span>
          <span class="li-name">${a.n}</span>
          <span class="li-city">${a.city}</span>
        </div>
        <div class="li-desc">${a.d}</div>
        ${a._dist != null ? `<div class="li-dist">距离约 ${a._dist < 1 ? Math.round(a._dist * 1000) + " 米" : a._dist.toFixed(1) + " 公里"}</div>` : ""}
      </div>`).join("")
    : `<div class="sr-empty" style="padding:20px">没有符合条件的地点</div>`;
  document.querySelectorAll(".list-item").forEach((el) => {
    el.onclick = () => {
      const a = ACTIVITIES[+el.dataset.id];
      map.setView([a._dlat, a._dlng], 14);
      showDetail(a);
      if (window.innerWidth <= 768) listPanel.classList.add("hidden");
    };
  });
}
document.getElementById("btn-list").onclick = () => {
  listPanel.classList.contains("hidden") ? openList() : listPanel.classList.add("hidden");
  positionDetail();
};
document.getElementById("btn-list-close").onclick = () => {
  listPanel.classList.add("hidden");
  positionDetail();
};

// ---------- 侧栏（移动端） / 关于 ----------
document.getElementById("btn-filter-toggle").onclick = () =>
  document.getElementById("sidebar").classList.toggle("open");
map.on("click", () => {
  document.getElementById("sidebar").classList.remove("open");
  hideDetail();
});

const aboutModal = document.getElementById("about-modal");
document.getElementById("btn-about").onclick = () => aboutModal.classList.remove("hidden");
document.getElementById("btn-about-close").onclick = () => aboutModal.classList.add("hidden");
aboutModal.addEventListener("click", (e) => { if (e.target === aboutModal) aboutModal.classList.add("hidden"); });

// ---------- 启动 ----------
buildFilterUI();
buildLegend();
renderMarkers();
