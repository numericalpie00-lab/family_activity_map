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
};
