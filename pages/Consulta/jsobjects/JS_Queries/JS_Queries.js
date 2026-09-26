export default {
  loadData: async function () {
    try {
      const results = await Promise.all([
        q_list_targets.run(),
        q_list_queries.run()
      ]);

      const targets = results[0] || [];
      const queries = results[1] || [];

      const targetsJson = btoa(
        unescape(
          encodeURIComponent(
            JSON.stringify(targets)
          )
        )
      );

      const queriesJson = btoa(
        unescape(
          encodeURIComponent(
            JSON.stringify(queries)
          )
        )
      );

      await storeValue(
        'targetsJson',
        targetsJson
      );

      await storeValue(
        'queriesJson',
        queriesJson
      );

      return {
        targets,
        queries
      };
    } catch (error) {
      showAlert(
        'Error cargando Consultas: ' + error.message,
        'error'
      );

      throw error;
    }
  },

  saveQuery: async function () {
    try {
      const result =
        await q_create_query.run();

      if (
        !Array.isArray(result) ||
        !result.length ||
        !result[0].query_id
      ) {
        throw new Error(
          'La consulta no devolvió confirmación de guardado.'
        );
      }

      const savedQuery =
        result[0];

      try {
        const queries =
          await q_list_queries.run();

        const queriesJson = btoa(
          unescape(
            encodeURIComponent(
              JSON.stringify(
                queries || []
              )
            )
          )
        );

        await storeValue(
          'queriesJson',
          queriesJson
        );
      } catch (refreshError) {
        console.error(
          'La consulta se guardó, pero no fue posible actualizar el listado.',
          refreshError
        );
      }

      await storeValue(
        'querySaveStatus',
        JSON.stringify({
          status: 'success',
          query_id:
            savedQuery.query_id,
          name:
            savedQuery.name,
          timestamp:
            Date.now()
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
          message:
            error.message,
          timestamp:
            Date.now()
        })
      );

      showAlert(
        'Error guardando consulta: ' +
        error.message,
        'error'
      );

      throw error;
    }
  }
}