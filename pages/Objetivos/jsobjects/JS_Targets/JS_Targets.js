export default {
  loadData: async function () {
    try {
      var plats = await q_list_platforms.run();
      var targets = await q_list_targets.run();
      var catalog = await q_list_all_platforms.run();
      storeValue('platformsJson', btoa(unescape(encodeURIComponent(JSON.stringify(plats || [])))));
      storeValue('targetsJson', btoa(unescape(encodeURIComponent(JSON.stringify(targets || [])))));
      storeValue('catalogJson', btoa(unescape(encodeURIComponent(JSON.stringify(catalog || [])))));
    } catch (e) {
      showAlert('Error cargando datos: ' + e.message, 'error');
    }
  },

  create: async function () {
    var m = CustomWidget1.model;
    if (!m.f_handle || !m.f_external) {
      showAlert('Complete handle y external id', 'error');
      return;
    }
    try {
      await q_create_target.run({ platform: m.f_platform, external_id: m.f_external, handle: m.f_handle });
      showAlert('Objetivo registrado', 'success');
      await JS_Targets.loadData();
    } catch (e) {
      showAlert('Error: ' + e.message, 'error');
    }
  },

  del: async function () {
    var id = CustomWidget1.model.del_id;
    if (!id) { return; }
    try {
      await q_delete_target.run({ id: id });
      await JS_Targets.loadData();
    } catch (e) {
      showAlert('Error: ' + e.message, 'error');
    }
  },

  toggle: async function () {
    var id = CustomWidget1.model.toggle_id;
    if (!id) { return; }
    try {
      await q_toggle_target.run({ id: id });
      await JS_Targets.loadData();
    } catch (e) {
      showAlert('Error: ' + e.message, 'error');
    }
  },

  togglePlatform: async function () {
    var code = CustomWidget1.model.toggle_platform_code;
    if (!code) { return; }
    try {
      await q_toggle_platform.run({ code: code });
      await JS_Targets.loadData();
    } catch (e) {
      showAlert('Error: ' + e.message, 'error');
    }
  }
}