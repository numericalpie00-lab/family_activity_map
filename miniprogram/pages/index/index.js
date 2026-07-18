const RAW = require("../../data/activities.js");
const CATS = require("../../data/categories.js");

const CAT_MAP = {};
CATS.forEach((c) => (CAT_MAP[c.id] = c));
const CITIES = ["深圳", "广州", "香港", "澳门", "珠海", "佛山", "东莞", "中山", "惠州", "江门", "肇庆"];

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371,
    toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1),
    dLng = toRad(lng2 - lng1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

Page({
  data: {
    lat: 22.75,
    lng: 113.7,
    scale: 8,
    markers: [],
    cats: CATS,
    cities: CITIES,
    selectedCats: [],
    selectedCity: "",
    onlyFree: false,
    io: "",
    keyword: "",
    searchHits: [],
    showFilter: false,
    showList: false,
    listTitle: "全部地点",
    listItems: [],
    shownCount: 0,
    sel: null,
    userPos: null,
  },

  onLoad() {
    this.applyFilter();
  },

  // ---------- 筛选 ----------
  filtered() {
    const { selectedCats, selectedCity, onlyFree, io, keyword } = this.data;
    const k = keyword.trim().toLowerCase();
    return RAW.filter((a) => {
      if (selectedCats.length && selectedCats.indexOf(a.c) < 0) return false;
      if (selectedCity && a.city !== selectedCity) return false;
      if (onlyFree && !a.free) return false;
      if (io === "indoor" && a.io === "outdoor") return false;
      if (io === "outdoor" && a.io === "indoor") return false;
      if (k) {
        const cat = CAT_MAP[a.c];
        const hay = (a.n + " " + a.city + " " + a.d + " " + (a.tags || []).join(" ") + " " + cat.label).toLowerCase();
        if (hay.indexOf(k) < 0) return false;
      }
      return true;
    });
  },

  applyFilter() {
    const shown = this.filtered();
    const markers = shown.map((a) => ({
      id: a._id,
      latitude: a.lat,
      longitude: a.lng,
      iconPath: "/assets/markers/" + a.c + ".png",
      width: 18,
      height: 18,
    }));
    this.setData({ markers, shownCount: shown.length });
    if (this.data.showList) this.refreshList();
  },

  onToggleCat(e) {
    const id = e.currentTarget.dataset.id;
    const sel = this.data.selectedCats.slice();
    const i = sel.indexOf(id);
    i > -1 ? sel.splice(i, 1) : sel.push(id);
    this.setData({ selectedCats: sel }, () => this.applyFilter());
  },

  onCity(e) {
    this.setData({ selectedCity: e.currentTarget.dataset.city }, () => this.applyFilter());
  },

  onFree() {
    this.setData({ onlyFree: !this.data.onlyFree }, () => this.applyFilter());
  },

  onIo(e) {
    const v = e.currentTarget.dataset.io;
    this.setData({ io: this.data.io === v ? "" : v }, () => this.applyFilter());
  },

  onReset() {
    this.setData(
      { selectedCats: [], selectedCity: "", onlyFree: false, io: "", keyword: "", searchHits: [] },
      () => this.applyFilter()
    );
  },

  // ---------- 搜索（全局，不受筛选限制） ----------
  onSearch(e) {
    const keyword = e.detail.value;
    const k = keyword.trim().toLowerCase();
    let hits = [];
    if (k) {
      hits = RAW.filter((a) => {
        const cat = CAT_MAP[a.c];
        const hay = (a.n + " " + a.city + " " + a.d + " " + (a.tags || []).join(" ") + " " + cat.label).toLowerCase();
        return hay.indexOf(k) > -1;
      })
        .slice(0, 8)
        .map((a) => ({ _id: a._id, n: a.n, city: a.city, emoji: CAT_MAP[a.c].emoji }));
    }
    this.setData({ keyword, searchHits: hits }, () => this.applyFilter());
  },

  onPickSearch(e) {
    const a = RAW[e.currentTarget.dataset.id];
    this.setData({ searchHits: [] });
    this.focusOn(a);
  },

  // ---------- 地图交互 ----------
  onMarkerTap(e) {
    const a = RAW.find((x) => x._id === e.detail.markerId);
    if (a) this.showDetail(a);
  },

  onMapTap() {
    this.setData({ sel: null, searchHits: [], showFilter: false });
  },

  focusOn(a) {
    this.setData({ lat: a.lat, lng: a.lng, scale: 13 });
    this.showDetail(a);
  },

  showDetail(a) {
    const cat = CAT_MAP[a.c];
    this.setData({
      sel: {
        ...a,
        emoji: cat.emoji,
        catLabel: cat.label,
        color: cat.color,
        ioLabel: a.io === "indoor" ? "🏠 室内" : a.io === "outdoor" ? "🌤 户外" : "🏠+🌤 室内外",
      },
      showList: false,
      showFilter: false,
    });
  },

  closeDetail() {
    this.setData({ sel: null });
  },

  onNav() {
    const s = this.data.sel;
    if (!s) return;
    wx.openLocation({
      latitude: s.lat,
      longitude: s.lng,
      name: s.n,
      address: s.city + " · " + s.addr,
      scale: 15,
    });
  },

  // ---------- 附近 ----------
  onLocate() {
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        this.setData(
          { userPos: { lat: res.latitude, lng: res.longitude }, lat: res.latitude, lng: res.longitude, scale: 11 },
          () => this.openListPanel("📍 离我最近")
        );
      },
      fail: () => {
        wx.showToast({ title: "定位失败，请在设置中允许位置权限", icon: "none" });
      },
    });
  },

  // ---------- 列表 ----------
  onFilter() {
    this.setData({ showFilter: !this.data.showFilter, showList: false, sel: null });
  },

  onList() {
    this.data.showList ? this.setData({ showList: false }) : this.openListPanel("全部地点");
  },

  openListPanel(title) {
    this.setData({ showList: true, showFilter: false, sel: null, listTitle: title }, () =>
      this.refreshList()
    );
  },

  refreshList() {
    let shown = this.filtered();
    const pos = this.data.userPos;
    if (pos) {
      shown = shown
        .map((a) => ({ ...a, _dist: haversine(pos.lat, pos.lng, a.lat, a.lng) }))
        .sort((x, y) => x._dist - y._dist);
    }
    const listItems = shown.map((a) => ({
      _id: a._id,
      n: a.n,
      city: a.city,
      d: a.d,
      emoji: CAT_MAP[a.c].emoji,
      distText:
        a._dist != null
          ? a._dist < 1
            ? "距离约 " + Math.round(a._dist * 1000) + " 米"
            : "距离约 " + a._dist.toFixed(1) + " 公里"
          : "",
    }));
    this.setData({ listItems });
  },

  onPickItem(e) {
    const a = RAW[e.currentTarget.dataset.id];
    this.setData({ showList: false });
    this.focusOn(a);
  },

  closePanels() {
    this.setData({ showFilter: false, showList: false });
  },

  onShareAppMessage() {
    return { title: "湾趣地图 · 大湾区亲子活动指南", path: "/pages/index/index" };
  },

  onShareTimeline() {
    return { title: "湾趣地图 · 大湾区亲子活动指南" };
  },
});
