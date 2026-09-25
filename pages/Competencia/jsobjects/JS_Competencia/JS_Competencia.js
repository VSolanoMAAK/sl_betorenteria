export default {
  loadData: async function () {
    try {
      var comp = await q_comp_compare.run();
      var targets = await q_comp_targets.run();
      var payload = { compare: comp || [], targets: targets || [] };
      storeValue('compJson', btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
    } catch (e) {
      showAlert('Error competencia: ' + e.message, 'error');
    }
  },
  toggle: async function (payload) {
    try {
      await q_toggle_comp.run({ id: payload.target_id });
      await this.loadData();
    } catch (e) {
      showAlert('Error al marcar competencia: ' + e.message, 'error');
    }
  }
}