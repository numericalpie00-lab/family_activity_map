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

// ---------- 地图初始化 ----------
const map = L.map("map", { zoomControl: false }).setView([22.75, 113.7], 9);
L.control.zoom({ position: "topright" }).addTo(map);

L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  maxZoom: 19,
  subdomains: "abcd",
}).addTo(map);

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
    const m = L.marker([a.lat, a.lng], { icon: makeIcon(a.c) });
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
      <a href="https://uri.amap.com/search?keyword=${q}" target="_blank" rel="noopener">高德地图</a>
      <a href="https://map.baidu.com/search/${q}" target="_blank" rel="noopener">百度地图</a>
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
  const bounds = L.latLngBounds(shown.map((a) => [a.lat, a.lng]));
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
      map.setView([a.lat, a.lng], 14);
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
      state.userPos = [pos.coords.latitude, pos.coords.longitude];
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.circleMarker(state.userPos, {
        radius: 9, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1,
      }).addTo(map).bindTooltip("我的位置");
      map.setView(state.userPos, 12);
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
      map.setView([a.lat, a.lng], 14);
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
