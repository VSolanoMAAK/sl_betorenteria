export default {
  loadData: async function () {
    try {
      const targets = await q_list_targets.run();

      const targetsJson = btoa(
        unescape(
          encodeURIComponent(
            JSON.stringify(targets || [])
          )
        )
      );

      await storeValue(
        'targetsJson',
        targetsJson
      );

      return targets || [];
    } catch (error) {
      showAlert(
        'Error cargando objetivos: ' + error.message,
        'error'
      );

      throw error;
    }
  }
}