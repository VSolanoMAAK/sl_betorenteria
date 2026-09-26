export default {

  loadData: async function () {
    try {
      const results =
        await Promise.all([
          q_ws_list_queries.run(),
          q_ws_list_targets.run()
        ]);

      return {
        queries:
          results[0] || [],

        targets:
          results[1] || []
      };
    } catch (error) {
      showAlert(
        'Error cargando el Constructor: ' +
          error.message,
        'error'
      );

      throw error;
    }
  },


  saveQuery: async function () {
    try {
      const result =
        await q_ws_create_query.run();

      const row =
        Array.isArray(result) &&
        result.length > 0
          ? result[0]
          : null;

      if (
        !row ||
        !row.query_id
      ) {
        showAlert(
          'La consulta no pudo guardarse. Revisa la configuración.',
          'error'
        );

        return null;
      }

      await Promise.all([
        storeValue(
          'activeQueryId',
          row.query_id
        ),

        storeValue(
          'activeQueryName',
          row.name
        )
      ]);

      await q_ws_list_queries.run();

      showAlert(
        'Consulta guardada correctamente.',
        'success'
      );

      return row;

    } catch (error) {

      const message =
        String(
          error &&
          error.message
            ? error.message
            : ''
        );

      if (
        /duplicate key|unique constraint|already exists/i.test(
          message
        )
      ) {
        showAlert(
          'Ya existe una consulta con ese nombre.',
          'warning'
        );

        return null;
      }

      showAlert(
        'Error guardando la consulta: ' +
          message,
        'error'
      );

      throw error;
    }
  }

}