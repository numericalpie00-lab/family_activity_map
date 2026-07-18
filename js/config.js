/**
 * 地图配置
 *
 * 天地图（国家官方地图，中文标注，内地访问快，坐标系与本站数据兼容）：
 * 1. 前往 https://console.tianditu.gov.cn/api/key 免费注册并创建「浏览器端」应用获取 key
 * 2. 将 key 填入下方 tiandituKey，提交到 main 分支即可生效
 *
 * tiandituKey 留空时，默认使用高德中文瓦片底图（免 key、内地加载快，GCJ-02 坐标系，
 * 标记点显示坐标会自动同步转换，无需人工处理）。
 */
const MAP_CONFIG = {
  tiandituKey: "",

  /**
   * 底图风格：
   *  "clean"  极简浅灰（CARTO Positron 无标注 + 自研中文地名层），道路极淡（默认）
   *  "amap"   高德中文瓦片 + 降饱和滤镜，内地加载更快但道路较明显
   */
  basemap: "clean",

  /**
   * 百度统计站点 ID（用于统计每日独立访客 UV / 访问量）：
   * 1. 前往 https://tongji.baidu.com 用百度账号登录
   * 2. 「管理 → 网站列表 → 新增网站」，域名填 numericalpie00-lab.github.io
   * 3. 在「获取代码」页面的脚本里，hm.js? 后面那串就是站点 ID，形如
   *    a1b2c3d4e5f6...，把它填到下面引号中即可
   * 留空时不加载任何统计脚本（不影响网站运行）。
   */
  baiduAnalyticsId: "",
};
