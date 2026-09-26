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
  },

  saveQuery: async function () {
    try {
      const result = await q_create_query.run();

      if (
        !Array.isArray(result) ||
        !result.length ||
        !result[0].query_id
      ) {
        throw new Error(
          'La consulta no devolvió confirmación de guardado.'
        );
      }

      const savedQuery = result[0];

      await storeValue(
        'querySaveStatus',
        JSON.stringify({
          status: 'success',
          query_id: savedQuery.query_id,
          name: savedQuery.name,
          timestamp: Date.now()
        })
      );

      showAlert(
        'Consulta guardada correctamente.',
        'success'
      );

      return savedQuery;
    } catch (error) {
      await storeValue(
        'querySaveStatus',
        JSON.stringify({
          status: 'error',
          message: error.message,
          timestamp: Date.now()
        })
      );

      showAlert(
        'Error guardando consulta: ' + error.message,
        'error'
      );

      throw error;
    }
  }
}