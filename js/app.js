/* ============ 湾趣地图 · 应用逻辑（中英双语） ============ */

const CATEGORIES = {
  playground: { emoji: "🎡", color: "#e07b39" },
  indoorplay: { emoji: "🏰", color: "#b8578f" },
  park:       { emoji: "🌳", color: "#4c9a52" },
  library:    { emoji: "📚", color: "#3a6ea5" },
  museum:     { emoji: "🏛", color: "#8e6bbf" },
  zoo:        { emoji: "🦁", color: "#2a9d8f" },
  beach:      { emoji: "🏖", color: "#e5b93c" },
  waterplay:  { emoji: "💦", color: "#2f8fd6" },
  hiking:     { emoji: "⛰", color: "#7a8450" },
  camping:    { emoji: "⛺", color: "#a9714b" },
  farm:       { emoji: "🍓", color: "#d1495b" },
  themepark:  { emoji: "🎢", color: "#c93a86" },
  mall:       { emoji: "🛍", color: "#4b4bb5" },
};

const CITIES = ["深圳", "广州", "香港", "澳门", "珠海", "佛山", "东莞", "中山", "惠州", "江门", "肇庆"];

// ---------- 状态 ----------
const state = {
  cats: new Set(),
  cities: new Set(),
  conds: new Set(),
  keyword: "",
  userPos: null,
  selected: null,        // 当前详情卡片对应地点
  listTitleKey: "all",   // all / near
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

const tdtKey = (typeof MAP_CONFIG !== "undefined" && MAP_CONFIG.tiandituKey) || "";
const BASEMAP = tdtKey ? "tianditu" : ((typeof MAP_CONFIG !== "undefined" && MAP_CONFIG.basemap) || "clean");
const DISPLAY_GCJ = BASEMAP === "amap";

let labelMarkers = []; // 中文地名标注（声明须早于底图块中的 addPlaceLabels 调用）

if (BASEMAP === "tianditu") {
  const tdtOpts = {
    subdomains: "01234567",
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.tianditu.gov.cn/">天地图</a> GS(2024)0568号',
  };
  L.tileLayer(`https://t{s}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tdtKey}`, tdtOpts).addTo(map);
  L.tileLayer(`https://t{s}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tdtKey}`, tdtOpts).addTo(map);
} else if (BASEMAP === "amap") {
  L.tileLayer("https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", {
    subdomains: "1234",
    maxZoom: 18,
    attribution: '&copy; 高德地图',
    className: "basemap-muted",
  }).addTo(map);
} else {
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  }).addTo(map);
  addPlaceLabels();
}

// 自研中文地名标注层（仅中文模式显示；英文模式隐藏，避免与英文界面混杂）
function addPlaceLabels() {
  if (typeof PLACE_LABELS === "undefined") return;
  map.createPane("placeLabels");
  map.getPane("placeLabels").style.zIndex = 450;
  map.getPane("placeLabels").style.pointerEvents = "none";
  labelMarkers = PLACE_LABELS.map((p) => {
    const m = L.marker([p.lat, p.lng], {
      pane: "placeLabels",
      interactive: false,
      keyboard: false,
      icon: L.divIcon({
        className: "",
        html: `<div class="place-label ${p.cls || ""}">${p.n}</div>`,
        iconSize: [0, 0],
      }),
    }).addTo(map);
    m._lblMin = p.min ?? 0;
    m._lblMax = p.max ?? 22;
    return m;
  });
  map.on("zoomend", updateLabels);
  updateLabels();
}
function updateLabels() {
  const z = map.getZoom();
  const showLabels = getLang() === "zh"; // 中文标注仅在中文界面显示
  labelMarkers.forEach((m) => {
    const el = m.getElement();
    if (el) el.style.display = showLabels && z >= m._lblMin && z <= m._lblMax ? "" : "none";
  });
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

// 搜索同时匹配中英文（名称/简介/城市/标签/分类），无论界面语言
function keywordMatch(a, k) {
  const en = (typeof ACTIVITIES_EN !== "undefined" && ACTIVITIES_EN[a.city + "|" + a.n]) || {};
  const enTags = (a.tags || []).map((tg) => (typeof TAG_I18N !== "undefined" && TAG_I18N[tg]) || "").join(" ");
  const hay = [
    a.n, a.d, a.city, (a.tags || []).join(" "),
    CAT_LABEL_I18N[a.c].zh, CAT_LABEL_I18N[a.c].en,
    en.n || "", en.d || "", CITY_I18N[a.city] || "", enTags,
  ].join(" ").toLowerCase();
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
  document.getElementById("result-count").textContent = t("resultCount", shown.length);
  updateCategoryCounts();
  if (!document.getElementById("list-panel").classList.contains("hidden")) renderList();
  return shown;
}

// ---------- 详情卡片 ----------
const detailCard = document.getElementById("detail-card");
function showDetail(a) {
  state.selected = a;
  const conf = CATEGORIES[a.c];
  const name = encodeURIComponent(a.n);           // 高德/百度用中文名更准
  const addr = encodeURIComponent(`${a.city} · ${a.addr}`);
  const googleQ = encodeURIComponent(`${placeName(a)} ${cityLabel(a.city)}`);
  const [glat, glng] = toGcj(a);
  const amapUrl = `https://uri.amap.com/marker?position=${glng.toFixed(6)},${glat.toFixed(6)}&name=${name}&src=wanqumap&coordinate=gaode&callnative=0`;
  const baiduUrl = `https://api.map.baidu.com/marker?location=${a.lat},${a.lng}&title=${name}&content=${addr}&output=html&coord_type=wgs84&src=web.wanqumap.gba`;
  const tags = placeTags(a).map((tg) => `<span class="dc-tag">${tg}</span>`).join("");
  const seasonTag = a.season ? `<span class="dc-tag warn">🗓 ${seasonLabel(a.season)}</span>` : "";
  const ioLabel = a.io === "indoor" ? t("ioIndoor") : a.io === "outdoor" ? t("ioOutdoor") : t("ioBoth");
  detailCard.innerHTML = `
    <button class="close-btn dc-close" onclick="hideDetail()">×</button>
    <span class="dc-cat" style="background:${conf.color}">${conf.emoji} ${catLabel(a.c)}</span>
    <h2>${placeName(a)}</h2>
    <p class="dc-desc">${placeDesc(a)}</p>
    <div class="dc-tags">
      <span class="dc-tag">👶 ${a.age}${t("ageSuffix")}</span>
      <span class="dc-tag">${a.free ? t("free") : t("paid")}</span>
      <span class="dc-tag">${ioLabel}</span>
      ${seasonTag}${tags}
    </div>
    <p class="dc-meta">📍 ${cityLabel(a.city)} · ${a.addr}</p>
    <div class="dc-nav">
      <a href="${amapUrl}" target="_blank" rel="noopener">${t("navAmap")}</a>
      <a href="${baiduUrl}" target="_blank" rel="noopener">${t("navBaidu")}</a>
      <a href="https://www.google.com/maps/search/?api=1&query=${googleQ}" target="_blank" rel="noopener">${t("navGoogle")}</a>
    </div>`;
  detailCard.classList.remove("hidden");
  positionDetail();
}
function hideDetail() { detailCard.classList.add("hidden"); state.selected = null; }
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
  catBox.innerHTML = "";
  Object.entries(CATEGORIES).forEach(([id, conf]) => {
    const b = document.createElement("button");
    b.className = "chip cat-chip" + (state.cats.has(id) ? " active" : "");
    b.dataset.cat = id;
    b.style.borderLeftColor = conf.color;
    b.innerHTML = `${conf.emoji} ${catLabel(id)}<span class="cat-count"></span>`;
    b.onclick = () => {
      state.cats.has(id) ? state.cats.delete(id) : state.cats.add(id);
      b.classList.toggle("active");
      renderMarkers();
    };
    catBox.appendChild(b);
  });

  const cityBox = document.getElementById("city-chips");
  cityBox.innerHTML = "";
  CITIES.forEach((city) => {
    const b = document.createElement("button");
    b.className = "chip" + (state.cities.has(city) ? " active" : "");
    b.textContent = cityLabel(city);
    b.onclick = () => {
      state.cities.has(city) ? state.cities.delete(city) : state.cities.add(city);
      b.classList.toggle("active");
      renderMarkers();
      zoomToFiltered();
    };
    cityBox.appendChild(b);
  });

  document.querySelectorAll(".cond-chip").forEach((b) => {
    b.classList.toggle("active", state.conds.has(b.dataset.cond));
    b.onclick = () => {
      const c = b.dataset.cond;
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
  document.getElementById("legend").innerHTML = Object.entries(CATEGORIES)
    .map(([id, c]) => `<span class="lg-item"><span class="lg-dot" style="background:${c.color}"></span>${catLabel(id)}</span>`)
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
  const hits = ACTIVITIES.filter((a) => keywordMatch(a, k)).slice(0, 8);
  searchResults.innerHTML = hits.length
    ? hits.map((a) => `<div class="sr-item" data-id="${a._id}">${CATEGORIES[a.c].emoji} ${placeName(a)}<span class="sr-city">${cityLabel(a.city)}</span></div>`).join("")
    : `<div class="sr-empty">${t("searchEmpty", k)}</div>`;
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
  if (!navigator.geolocation) { alert(t("geoUnsupported")); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.userPos = [pos.coords.latitude, pos.coords.longitude];
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
      }).addTo(map).bindTooltip(t("myLocation"));
      map.setView(dispPos, 12);
      openList("near");
    },
    () => alert(t("geoFail")),
    { enableHighAccuracy: true, timeout: 8000 }
  );
};

// ---------- 列表视图 ----------
const listPanel = document.getElementById("list-panel");
function openList(titleKey) {
  state.listTitleKey = titleKey || "all";
  document.getElementById("list-title").textContent =
    state.listTitleKey === "near" ? t("listTitleNear") : t("listTitleAll");
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
          <span class="li-name">${placeName(a)}</span>
          <span class="li-city">${cityLabel(a.city)}</span>
        </div>
        <div class="li-desc">${placeDesc(a)}</div>
        ${a._dist != null ? `<div class="li-dist">${a._dist < 1 ? t("distMeters", Math.round(a._dist * 1000)) : t("distKm", a._dist.toFixed(1))}</div>` : ""}
      </div>`).join("")
    : `<div class="sr-empty" style="padding:20px">${t("noResult")}</div>`;
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
  listPanel.classList.contains("hidden") ? openList("all") : listPanel.classList.add("hidden");
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

// ---------- 语言：静态文案 + 切换 ----------
function applyStaticText() {
  const L = getLang();
  document.documentElement.lang = L === "zh" ? "zh-CN" : "en";
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("brand-sub", t("brandSub"));
  set("btn-list", t("listBtn"));
  set("filter-title", t("filterTitle"));
  set("btn-reset", t("clearAll"));
  set("cat-header", t("catHeader"));
  set("city-header", t("cityHeader"));
  set("cond-header", t("condHeader"));
  set("foot-note", t("footNote"));
  set("btn-locale", t("localeBtn"));
  set("btn-locate", t("locateBtn"));
  set("btn-filter-toggle", t("filterFab"));
  document.querySelector('[data-cond="free"]').textContent = t("condFree");
  document.querySelector('[data-cond="indoor"]').textContent = t("condIndoor");
  document.querySelector('[data-cond="outdoor"]').textContent = t("condOutdoor");
  document.querySelector('[data-cond="toddler"]').textContent = t("condToddler");
  searchInput.placeholder = t("searchPlaceholder");
  // 纠错链接
  const fix = document.getElementById("foot-fix");
  if (fix) fix.innerHTML = `${t("footFix1")}<a href="https://github.com/numericalpie00-lab/family_activity_map/issues" target="_blank" rel="noopener">${t("footFix2")}</a>`;
  // 关于弹窗
  const ab = document.getElementById("about-body");
  if (ab) {
    ab.innerHTML = `
      <h2>${t("aboutTitle")}</h2>
      <p>${t("aboutP1a")}<strong>${t("aboutP1b")}</strong>${t("aboutP1c")}</p>
      <p>${t("aboutP2")}</p>
      <ul>
        <li>${t("aboutLi1")}</li>
        <li>${t("aboutLi2")}</li>
        <li>${t("aboutLi3")}</li>
      </ul>
      <p class="muted">${t("aboutMuted")}</p>`;
  }
}

function applyLang(newLang) {
  setLang(newLang);
  applyStaticText();
  buildFilterUI();
  buildLegend();
  renderMarkers();
  updateLabels();
  if (state.selected) showDetail(state.selected);
  if (!listPanel.classList.contains("hidden")) openList(state.listTitleKey);
}

document.getElementById("btn-locale").onclick = () => {
  applyLang(getLang() === "zh" ? "en" : "zh");
};

// ---------- 启动 ----------
applyStaticText();     // 依据浏览器语言自动应用（i18n.detectLang）
buildFilterUI();
buildLegend();
renderMarkers();
