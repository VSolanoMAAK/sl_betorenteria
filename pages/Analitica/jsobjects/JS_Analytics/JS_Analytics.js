export default {
  loadData: async function () {
    try {
      var d = await q_ana_daily.run();
      var t = await q_ana_tipo.run();
      var g = await q_ana_genero.run();
      var h = await q_ana_hora.run();
      var pl = await q_ana_plataformas.run();
      var payload = { daily: d || [], tipo: t || [], genero: g || [], hora: h || [], plataformas: pl || [] };
      storeValue('analyticsJson', btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
    } catch (e) {
      showAlert('Error analítica: ' + e.message, 'error');
    }
  }
}