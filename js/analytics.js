/**
 * 访问统计接入。在 js/config.js 里填了标识才加载对应脚本，否则什么都不做。
 * 二选一（GoatCounter 优先）：
 *   - GoatCounter：后台 https://<code>.goatcounter.com ，Visits 即每日独立访客
 *   - 百度统计：  后台 https://tongji.baidu.com
 */
(function () {
  var cfg = typeof MAP_CONFIG !== "undefined" ? MAP_CONFIG : {};

  // GoatCounter
  var gc = cfg.goatcounterCode || "";
  if (gc) {
    var g = document.createElement("script");
    g.async = true;
    g.src = "//gc.zgo.at/count.js";
    g.setAttribute("data-goatcounter", "https://" + gc + ".goatcounter.com/count");
    document.head.appendChild(g);
    return;
  }

  // 百度统计（备选）
  var id = cfg.baiduAnalyticsId || "";
  if (id) {
    window._hmt = window._hmt || [];
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?" + id;
    hm.async = true;
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
  }
})();
