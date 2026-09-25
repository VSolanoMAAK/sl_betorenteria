export default {
  loadData: async function () {
    try {
      var l = await q_mentions_list.run();
      var t = await q_mentions_top.run();
      var payload = { list: l || [], top: t || [] };
      storeValue('mentionsJson', btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
    } catch (e) {
      showAlert('Error menciones: ' + e.message, 'error');
    }
  }
}