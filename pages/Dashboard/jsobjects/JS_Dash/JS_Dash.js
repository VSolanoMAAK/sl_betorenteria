export default {
  loadData: async function () {
    try {
      var k = await q_dash_kpis.run();
      var d = await q_dash_daily.run();
      var t = await q_dash_top.run();
      var pl = await q_dash_platform.run();
      var payload = { kpis: (k && k[0]) || {}, daily: d || [], top: t || [], platforms: pl || [] };
      storeValue('dashJson', btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
    } catch (e) {
      showAlert('Error dashboard: ' + e.message, 'error');
    }
  }
}