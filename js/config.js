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
   * 访问统计（每日独立访客 UV / 访问量）。填任意一个即可，GoatCounter 优先。
   *
   * —— GoatCounter（推荐，最省事，需能访问外网看后台）——
   * 1. 打开 https://www.goatcounter.com/signup
   * 2. 「Code」填一个你喜欢的名字（比如 wanqu），邮箱密码注册
   * 3. 把这个名字填到下面 goatcounterCode 里就行
   * 之后在 https://<你的名字>.goatcounter.com 看数据，Visits 就是每日独立访客。
   */
  goatcounterCode: "numericalpipie",

  /**
   * —— 百度统计（备选，内地无需外网即可看后台）——
   * https://tongji.baidu.com 登录 →「管理→新增网站」→「获取代码」，
   * 脚本里 hm.js? 后面那串就是 ID，填到下面。
   */
  baiduAnalyticsId: "",
};
