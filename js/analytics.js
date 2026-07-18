/**
 * 访问统计接入（百度统计）
 * 仅当 js/config.js 中填了 baiduAnalyticsId 时才加载脚本；否则什么都不做。
 * 数据在百度统计后台查看：https://tongji.baidu.com （每日独立访客 UV / 访问量 / 来源等）
 */
(function () {
  var id = (typeof MAP_CONFIG !== "undefined" && MAP_CONFIG.baiduAnalyticsId) || "";
  if (!id) return;
  window._hmt = window._hmt || [];
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?" + id;
  hm.async = true;
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();
