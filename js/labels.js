/**
 * 中文地名标注层（配合无标注极简底图使用）
 * cls: "city" 城市级大标注；min/max: 显示的缩放级别范围
 */
const PLACE_LABELS = [
  // 城市
  { n: "深圳", lat: 22.545, lng: 114.06, cls: "city", min: 0, max: 11 },
  { n: "广州", lat: 23.13, lng: 113.26, cls: "city", min: 0, max: 11 },
  { n: "香港", lat: 22.30, lng: 114.17, cls: "city", min: 0, max: 11 },
  { n: "澳门", lat: 22.19, lng: 113.545, cls: "city", min: 0, max: 11 },
  { n: "珠海", lat: 22.27, lng: 113.575, cls: "city", min: 0, max: 11 },
  { n: "佛山", lat: 23.02, lng: 113.12, cls: "city", min: 0, max: 11 },
  { n: "东莞", lat: 23.02, lng: 113.75, cls: "city", min: 0, max: 11 },
  { n: "中山", lat: 22.52, lng: 113.39, cls: "city", min: 0, max: 11 },
  { n: "惠州", lat: 23.09, lng: 114.41, cls: "city", min: 0, max: 11 },
  { n: "江门", lat: 22.58, lng: 113.08, cls: "city", min: 0, max: 11 },
  { n: "肇庆", lat: 23.05, lng: 112.47, cls: "city", min: 0, max: 11 },
  // 深圳各区
  { n: "南山", lat: 22.53, lng: 113.93, min: 10, max: 15 },
  { n: "福田", lat: 22.54, lng: 114.05, min: 10, max: 15 },
  { n: "罗湖", lat: 22.55, lng: 114.13, min: 10, max: 15 },
  { n: "宝安", lat: 22.56, lng: 113.88, min: 10, max: 15 },
  { n: "龙华", lat: 22.65, lng: 114.03, min: 10, max: 15 },
  { n: "龙岗", lat: 22.72, lng: 114.25, min: 10, max: 15 },
  { n: "盐田", lat: 22.56, lng: 114.24, min: 10, max: 15 },
  { n: "坪山", lat: 22.70, lng: 114.35, min: 10, max: 15 },
  { n: "光明", lat: 22.75, lng: 113.92, min: 10, max: 15 },
  { n: "大鹏", lat: 22.59, lng: 114.48, min: 10, max: 15 },
  // 广州各区
  { n: "天河", lat: 23.12, lng: 113.36, min: 10, max: 15 },
  { n: "越秀", lat: 23.13, lng: 113.27, min: 10, max: 15 },
  { n: "海珠", lat: 23.08, lng: 113.32, min: 10, max: 15 },
  { n: "荔湾", lat: 23.09, lng: 113.23, min: 10, max: 15 },
  { n: "白云", lat: 23.17, lng: 113.27, min: 10, max: 15 },
  { n: "番禺", lat: 22.94, lng: 113.38, min: 10, max: 15 },
  { n: "黄埔", lat: 23.10, lng: 113.46, min: 10, max: 15 },
  { n: "花都", lat: 23.40, lng: 113.22, min: 10, max: 15 },
  { n: "南沙", lat: 22.80, lng: 113.53, min: 10, max: 15 },
  { n: "从化", lat: 23.55, lng: 113.59, min: 10, max: 15 },
  { n: "增城", lat: 23.26, lng: 113.83, min: 10, max: 15 },
  // 香港
  { n: "九龙", lat: 22.32, lng: 114.18, min: 10, max: 15 },
  { n: "香港岛", lat: 22.26, lng: 114.19, min: 10, max: 15 },
  { n: "沙田", lat: 22.38, lng: 114.19, min: 10, max: 15 },
  { n: "荃湾", lat: 22.37, lng: 114.11, min: 10, max: 15 },
  { n: "大屿山", lat: 22.26, lng: 113.95, min: 10, max: 15 },
  { n: "西贡", lat: 22.38, lng: 114.27, min: 10, max: 15 },
  // 澳门
  { n: "氹仔", lat: 22.155, lng: 113.555, min: 11, max: 15 },
  { n: "路环", lat: 22.12, lng: 113.56, min: 11, max: 15 },
  // 珠海
  { n: "香洲", lat: 22.27, lng: 113.55, min: 10, max: 15 },
  { n: "横琴", lat: 22.12, lng: 113.54, min: 10, max: 15 },
  { n: "斗门", lat: 22.21, lng: 113.29, min: 10, max: 15 },
  // 佛山
  { n: "禅城", lat: 23.02, lng: 113.11, min: 10, max: 15 },
  { n: "南海", lat: 23.03, lng: 113.14, min: 10, max: 15 },
  { n: "顺德", lat: 22.84, lng: 113.29, min: 10, max: 15 },
  { n: "三水", lat: 23.16, lng: 112.90, min: 10, max: 15 },
  { n: "高明", lat: 22.90, lng: 112.89, min: 10, max: 15 },
  // 东莞
  { n: "松山湖", lat: 22.92, lng: 113.88, min: 10, max: 15 },
  { n: "虎门", lat: 22.82, lng: 113.67, min: 10, max: 15 },
  { n: "常平", lat: 22.99, lng: 114.03, min: 10, max: 15 },
  // 惠州
  { n: "惠城", lat: 23.08, lng: 114.40, min: 10, max: 15 },
  { n: "惠东", lat: 22.98, lng: 114.72, min: 10, max: 15 },
  { n: "博罗", lat: 23.17, lng: 114.29, min: 10, max: 15 },
  // 中山 / 江门 / 肇庆
  { n: "翠亨", lat: 22.41, lng: 113.44, min: 11, max: 15 },
  { n: "新会", lat: 22.52, lng: 113.03, min: 10, max: 15 },
  { n: "台山", lat: 22.25, lng: 112.79, min: 10, max: 15 },
  { n: "开平", lat: 22.38, lng: 112.70, min: 10, max: 15 },
  { n: "鹤山", lat: 22.77, lng: 112.96, min: 10, max: 15 },
  { n: "鼎湖", lat: 23.16, lng: 112.57, min: 10, max: 15 },
];
