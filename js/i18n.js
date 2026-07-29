/* ============ 湾趣地图 · 中英文 i18n ============ */

const I18N = {
  zh: {
    brandSub: "大湾区亲子活动指南",
    searchPlaceholder: "搜索地点、城市、关键词…",
    listBtn: "☰ 列表",
    filterTitle: "筛选",
    clearAll: "清除全部",
    catHeader: "分类",
    cityHeader: "城市",
    condHeader: "条件",
    condFree: "🆓 免费",
    condIndoor: "🏠 室内(雨天)",
    condOutdoor: "🌤 户外",
    condToddler: "👶 幼儿友好",
    footNote: "📍 坐标为近似位置，出行前请以导航为准。",
    footFix1: "数据有误？",
    footFix2: "帮我们纠错",
    localeBtn: "EN",
    locateBtn: "🎯 附近",
    filterFab: "⚲ 筛选",
    listTitleAll: "全部地点",
    listTitleNear: "📍 离我最近",
    resultCount: (n) => `共找到 ${n} 个地点` + (n ? "，点击地图图标查看详情" : "，试试放宽筛选条件"),
    cityAll: "全部",
    aboutTitle: "🧭 湾趣地图",
    aboutP1a: "一张覆盖",
    aboutP1b: "粤港澳大湾区 11 城",
    aboutP1c: "的亲子活动地图：广州、深圳、珠海、佛山、惠州、东莞、中山、江门、肇庆、香港、澳门。",
    aboutP2: "公园、海滩、博物馆、玩水、采摘、露营……周末去哪儿遛娃，打开地图就知道。",
    aboutLi1: "🎯 点「附近」按钮，查看你身边的活动",
    aboutLi2: "⚲ 用筛选组合出「免费 + 室内」等雨天方案",
    aboutLi3: "🗺 详情卡片一键跳转高德 / 百度 / Google 地图导航",
    aboutMuted: "坐标为近似位置，营业信息可能变化，出行前请核实。本站为开源公益项目，不含任何商业推广；仅统计匿名访问量，不收集任何个人信息。",
    ageSuffix: "岁",
    free: "🆓 免费",
    paid: "💰 收费",
    ioIndoor: "🏠 室内",
    ioOutdoor: "🌤 户外",
    ioBoth: "🏠+🌤 室内外",
    navAmap: "高德地图",
    navBaidu: "百度地图",
    navGoogle: "Google",
    detailNote: "",
    distMeters: (m) => `距离约 ${m} 米`,
    distKm: (k) => `距离约 ${k} 公里`,
    searchEmpty: (k) => `没有找到「${k}」，试试别的关键词？`,
    noResult: "没有符合条件的地点",
    geoUnsupported: "当前浏览器不支持定位",
    geoFail: "定位失败，请允许浏览器获取位置权限。\n提示：部分浏览器要求 HTTPS 才能定位。",
    myLocation: "我的位置",
  },
  en: {
    brandSub: "Greater Bay Area Family Guide",
    searchPlaceholder: "Search places, cities, keywords…",
    listBtn: "☰ List",
    filterTitle: "Filters",
    clearAll: "Clear all",
    catHeader: "CATEGORY",
    cityHeader: "CITY",
    condHeader: "CONDITIONS",
    condFree: "🆓 Free",
    condIndoor: "🏠 Indoor (rainy)",
    condOutdoor: "🌤 Outdoor",
    condToddler: "👶 Toddler-friendly",
    footNote: "📍 Coordinates are approximate — follow your maps app when heading out.",
    footFix1: "Spotted an error? ",
    footFix2: "Help us fix it",
    localeBtn: "中",
    locateBtn: "🎯 Nearby",
    filterFab: "⚲ Filters",
    listTitleAll: "All places",
    listTitleNear: "📍 Nearest to me",
    resultCount: (n) => (n ? `${n} places found — tap a pin for details` : `No places found — try loosening the filters`),
    cityAll: "All",
    aboutTitle: "🧭 WanQu Map",
    aboutP1a: "A family-activity map covering all ",
    aboutP1b: "11 Greater Bay Area cities",
    aboutP1c: ": Guangzhou, Shenzhen, Zhuhai, Foshan, Huizhou, Dongguan, Zhongshan, Jiangmen, Zhaoqing, Hong Kong and Macau.",
    aboutP2: "Parks, beaches, museums, water play, U-pick farms, camping… wondering where to take the kids this weekend? Just open the map.",
    aboutLi1: "🎯 Tap “Nearby” to see activities around you",
    aboutLi2: "⚲ Combine filters like “Free + Indoor” for rainy-day plans",
    aboutLi3: "🗺 Detail cards jump straight to AMap / Baidu / Google Maps",
    aboutMuted: "Coordinates are approximate and opening details may change — please verify before visiting. This is an open-source non-profit project with no advertising; only anonymous visit counts are collected, never personal data.",
    ageSuffix: " yrs",
    free: "🆓 Free",
    paid: "💰 Paid",
    ioIndoor: "🏠 Indoor",
    ioOutdoor: "🌤 Outdoor",
    ioBoth: "🏠+🌤 Indoor/Outdoor",
    navAmap: "AMap",
    navBaidu: "Baidu",
    navGoogle: "Google",
    detailNote: "",
    distMeters: (m) => `~${m} m away`,
    distKm: (k) => `~${k} km away`,
    searchEmpty: (k) => `No match for “${k}” — try another keyword?`,
    noResult: "No places match these filters",
    geoUnsupported: "Your browser doesn't support geolocation",
    geoFail: "Location failed. Please allow location access.\nTip: some browsers require HTTPS for geolocation.",
    myLocation: "My location",
  },
};

const CITY_I18N = {
  "深圳": "Shenzhen", "广州": "Guangzhou", "香港": "Hong Kong", "澳门": "Macau",
  "珠海": "Zhuhai", "佛山": "Foshan", "东莞": "Dongguan", "中山": "Zhongshan",
  "惠州": "Huizhou", "江门": "Jiangmen", "肇庆": "Zhaoqing",
};

const CAT_LABEL_I18N = {
  playground: { zh: "游乐场", en: "Playground" },
  indoorplay: { zh: "室内乐园", en: "Indoor Play" },
  park: { zh: "公园绿地", en: "Parks" },
  library: { zh: "图书馆", en: "Library" },
  museum: { zh: "博物馆·科普", en: "Museum & Science" },
  zoo: { zh: "动物·海洋", en: "Zoo & Aquarium" },
  beach: { zh: "海滩", en: "Beach" },
  waterplay: { zh: "玩水", en: "Water Play" },
  hiking: { zh: "徒步·自然", en: "Hiking & Nature" },
  camping: { zh: "露营", en: "Camping" },
  farm: { zh: "采摘农场", en: "U-Pick Farm" },
  themepark: { zh: "主题乐园", en: "Theme Park" },
  mall: { zh: "商场亲子", en: "Mall Fun" },
};

const SEASON_I18N = {
  "全年": "Year-round",
  "6-8月李子 / 11-1月柑橘": "Plums Jun–Aug / Citrus Nov–Jan",
  "全年花期轮换": "Flowers rotate year-round",
};

const TAG_I18N = {
  "海景": "Sea view", "骑行": "Cycling", "观鸟": "Birdwatching", "草坪": "Lawn", "风筝": "Kite-flying",
  "栈道": "Boardwalk", "花田": "Flower field", "湖景": "Lake view", "夜景": "Night view", "湿地": "Wetland",
  "科普": "Science", "机动游戏": "Rides", "摩天轮": "Ferris wheel", "滨海": "Seaside", "少儿区": "Kids' area",
  "空调": "A/C", "绘本": "Picture books", "故事会": "Storytime", "历史": "History", "动物": "Animals",
  "投喂": "Feeding", "过山车": "Roller coaster", "演出": "Shows", "景观": "Scenery", "缆车": "Cable car",
  "山景": "Mountain view", "沙滩": "Beach", "需预约": "Booking needed", "民宿": "Guesthouses", "观星": "Stargazing",
  "登山": "Hiking", "云海": "Sea of clouds", "绿道": "Greenway", "入门徒步": "Easy hike", "瀑布": "Waterfall",
  "溪谷": "Stream valley", "奶牛": "Dairy cows", "滑草": "Grass sledding", "古镇": "Old town", "客家": "Hakka",
  "喷泉": "Fountain", "餐饮": "Dining", "熊猫": "Pandas", "小火车": "Mini train", "滑道": "Water slides",
  "造浪池": "Wave pool", "市区": "Downtown", "亲民": "Affordable", "白鲸": "Beluga", "室内": "Indoor",
  "少儿部": "Kids' section", "地标": "Landmark", "分龄": "Age-based", "恐龙": "Dinosaurs", "互动": "Interactive",
  "IMAX": "IMAX", "五羊": "Five Rams", "野餐": "Picnic", "环湖": "Lakeside loop", "花海": "Flower sea",
  "自然教育": "Nature education", "温室": "Greenhouse", "沙池": "Sandpit", "戏水": "Water play", "江景": "River view",
  "滑雪": "Skiing", "水乐园": "Water park", "森林": "Forest", "赏花": "Flower viewing", "游船": "Boat ride",
  "采摘": "U-pick", "古村": "Old village", "迪士尼": "Disney", "烟花": "Fireworks", "海洋馆": "Aquarium",
  "全年开放": "Open year-round", "亲民票价": "Low price", "天文": "Astronomy", "球幕": "Dome screen", "艺术": "Art",
  "海景草坪": "Seaside lawn", "玩具图书馆": "Toy library", "火烈鸟": "Flamingos", "游乐场": "Playground", "观鸟园": "Aviary",
  "泳滩": "Swim beach", "救生员": "Lifeguards", "拍照": "Photo spot", "水清": "Clear water", "大佛": "Big Buddha",
  "远足": "Hiking", "露营": "Camping", "海岛": "Island", "生态": "Eco", "方舟": "Ark",
  "灵长类": "Primates", "天文馆": "Planetarium", "黑沙": "Black sand", "烧烤": "BBQ", "葡式建筑": "Portuguese buildings",
  "灯塔": "Lighthouse", "航海": "Maritime", "光影": "Light & shadow", "沉浸式": "Immersive", "鲸鲨": "Whale shark",
  "海洋科学": "Marine science", "海滨": "Waterfront", "海洋文化": "Ocean culture", "红树林": "Mangrove", "步道": "Trail",
  "观景": "Viewpoint", "度假": "Resort", "少儿馆": "Kids' library", "陶艺": "Pottery", "体验": "Hands-on",
  "名山": "Famous mountain", "水景": "Waterscape", "荷花": "Lotus", "夏季": "Summer", "机器人": "Robots",
  "性价比": "Great value", "园林": "Garden", "古典": "Classical", "研学": "Study tour", "鸟语林": "Bird garden",
  "民国": "Republic-era", "5A": "5A-rated", "出海": "Boat trip", "观景台": "Lookout", "海龟": "Sea turtles",
  "索道": "Ropeway", "避暑": "Cool retreat", "竹林": "Bamboo forest", "世遗": "World Heritage", "碉楼": "Watchtowers",
  "温泉": "Hot spring", "水世界": "Water world", "华侨": "Overseas Chinese", "喀斯特": "Karst", "玩水": "Water play",
  "滑冰": "Ice skating", "亲子餐厅": "Family dining", "Meland": "Meland", "街区": "Open-air block", "马术": "Horse riding",
  "艺术展": "Art exhibit", "卡丁车": "Go-karts", "室内动物园": "Indoor zoo", "乐高": "LEGO", "VR": "VR",
  "蹦床": "Trampoline", "山姆": "Sam's Club", "电影": "Cinema", "电玩": "Arcade", "攀岩": "Climbing",
  "动物乐园": "Animal park", "室内乐园": "Indoor playground", "熊出没": "Boonie Bears", "IP": "IP theme", "科技": "Tech",
  "彩色小镇": "Colorful town", "观光": "Sightseeing", "风洞": "Wind tunnel", "运动": "Sports", "早教": "Early learning",
  "真冰场": "Real ice rink", "托马斯": "Thomas", "水秀": "Water show", "角色扮演": "Role play", "网红": "Trendy",
  "球池": "Ball pit", "滑梯": "Slides", "高颜值": "Photogenic", "旗舰店": "Flagship", "冰雪": "Ice & snow",
  "课程": "Classes", "闯关": "Obstacle course", "真冰": "Real ice", "培训": "Training", "木玩": "Wooden toys",
  "低龄": "Toddlers", "幼儿": "Toddlers", "民俗": "Folk culture", "科技馆": "Science museum", "三馆合一": "3-in-1 venue",
  "建筑": "Architecture", "老牌": "Classic", "植物园": "Botanical garden", "古生物": "Paleontology", "新馆": "New venue",
  "农事": "Farm work", "手作": "Crafts", "抓鱼": "Fish catching", "古城": "Old fort", "徒步": "Hiking",
  "飞盘": "Frisbee", "古庙": "Old temple", "无动力": "No-power play", "长滑梯": "Long slide", "章鱼滑梯": "Octopus slide",
  "社区": "Community", "特展": "Special exhibits", "地质": "Geology", "化石": "Fossils", "电子": "Electronics",
  "创新": "Innovation", "方所": "Fangsuo Books", "博物馆": "Museum", "工作坊": "Workshops", "宝贝王": "Wanda Kids",
  "市集": "Market", "职业体验": "Role-play jobs", "奈尔宝": "Nubo", "戏雪": "Snow play", "恒温": "Heated",
  "全年": "Year-round", "亲子剧": "Kids' theatre", "兴趣班": "Classes", "公益": "Non-profit", "水乡": "Water town",
  "西关": "Xiguan", "大白象": "Elephant slide", "中医药": "TCM", "非遗": "Heritage crafts", "锦鲤": "Koi",
  "水鸟": "Waterbirds", "禾雀花": "Bauhinia bloom", "溯溪": "Stream trekking", "广府": "Cantonese", "写生": "Sketching",
  "木棉": "Kapok tree", "梅花": "Plum blossom", "采石场": "Old quarry", "莲花": "Lotus", "玩具": "Toys",
  "购物": "Shopping", "空中花园": "Sky garden", "溜冰": "Ice skating", "影院": "Cinema", "新商场": "New mall",
  "冲浪": "Surfing", "数码": "Digital fun", "亲子商场": "Family mall", "史诺比": "Snoopy", "免费乐园": "Free playground",
  "充气城堡": "Bouncy castle", "攀爬网": "Climbing net", "天台": "Rooftop", "忍者": "Ninja course", "彩虹滑梯": "Rainbow slide",
  "故宫": "Palace Museum", "单车": "Bikes", "堡垒": "Fort", "免费": "Free", "火车": "Trains",
  "白海豚": "White dolphins", "渔村": "Fishing village", "嘉年华": "Carnival", "维港": "Victoria Harbour", "攀爬": "Climbing",
  "度假村": "Resort", "铁塔": "Eiffel Tower", "滑索": "Zipline", "英伦": "British theme", "展览": "Exhibition",
  "白沙滩": "White-sand beach", "赛车": "Racing", "模拟器": "Simulator", "炮台": "Fort", "益智": "Educational",
  "工坊": "Workshop", "小镇": "Town", "醒狮": "Lion dance", "红木": "Rosewood", "侨乡": "Qiaoxiang town",
  "玩泥巴": "Mud play",
};

// ---------- 语言状态 ----------
function detectLang() {
  const saved = localStorage.getItem("wq_lang");
  if (saved === "zh" || saved === "en") return saved;
  const nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
  return nav.startsWith("zh") ? "zh" : "en"; // 中文浏览器→中文，其余→英文
}
let LANG = detectLang();
function getLang() { return LANG; }
function setLang(l) { LANG = l; localStorage.setItem("wq_lang", l); }
function t(key, ...args) {
  const v = I18N[LANG][key];
  return typeof v === "function" ? v(...args) : v;
}
function cityLabel(city) { return LANG === "en" ? (CITY_I18N[city] || city) : city; }
function catLabel(id) { return CAT_LABEL_I18N[id] ? CAT_LABEL_I18N[id][LANG] : id; }
function seasonLabel(s) { return LANG === "en" ? (SEASON_I18N[s] || s) : s; }
function tagLabel(tag) { return LANG === "en" ? (TAG_I18N[tag] || tag) : tag; }

// 返回地点在当前语言下的 名称 / 简介 / 标签
function placeName(a) {
  if (LANG === "en" && typeof ACTIVITIES_EN !== "undefined") {
    const e = ACTIVITIES_EN[a.city + "|" + a.n];
    if (e && e.n) return e.n;
  }
  return a.n;
}
function placeDesc(a) {
  if (LANG === "en" && typeof ACTIVITIES_EN !== "undefined") {
    const e = ACTIVITIES_EN[a.city + "|" + a.n];
    if (e && e.d) return e.d;
  }
  return a.d;
}
function placeTags(a) { return (a.tags || []).map(tagLabel); }
