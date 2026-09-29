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
    let result;

    try {
      result =
        await q_ws_create_query.run();

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


    const queryId =
      String(
        row.query_id || ''
      ).trim();

    const queryName =
      String(
        row.name || ''
      ).trim();

    const queryStatus =
      String(
        row.status || 'active'
      )
        .trim()
        .toLowerCase();

    const useWeb =
      row.use_web === true ||
      String(
        row.use_web
      )
        .trim()
        .toLowerCase() === 'true';


    /*
     * La consulta recién creada pasa a ser
     * la consulta seleccionada actual.
     *
     * Se conservan también activeQueryId /
     * activeQueryName como compatibilidad
     * con componentes anteriores.
     */
    try {
      await Promise.all([
        storeValue(
          'selectedQueryId',
          queryId
        ),

        storeValue(
          'selectedQueryName',
          queryName
        ),

        storeValue(
          'activeQueryId',
          queryId
        ),

        storeValue(
          'activeQueryName',
          queryName
        )
      ]);

      await q_ws_list_queries.run();

    } catch (error) {

      const message =
        String(
          error &&
          error.message
            ? error.message
            : ''
        );

      showAlert(
        'La consulta fue guardada, pero no fue posible actualizar su selección: ' +
          message,
        'warning'
      );

      return row;
    }


    /*
     * Una consulta WEB activa debe ejecutar
     * inmediatamente su primera búsqueda.
     *
     * La creación de la consulta ya generó:
     *
     * - sl_web_keywords
     * - sl_query_web_keywords
     *
     * por lo que q_ws_web_search_v2 puede
     * trabajar inmediatamente con queryId.
     */
    if (
      useWeb &&
      queryStatus === 'active'
    ) {
      try {
        await q_ws_web_search_v2.run();

        await q_ws_list_web_mentions.run();

        showAlert(
          'Consulta guardada y búsqueda web inicial ejecutada correctamente.',
          'success'
        );

      } catch (error) {

        const message =
          String(
            error &&
            error.message
              ? error.message
              : ''
          );

        /*
         * La consulta YA fue guardada.
         * Un fallo de Tavily no debe presentarse
         * como un fallo de creación.
         */
        showAlert(
          'La consulta fue guardada correctamente, pero la búsqueda web inicial falló: ' +
            message,
          'warning'
        );
      }

      return row;
    }


    /*
     * Las consultas sin WEB o creadas como
     * inactivas solamente se guardan.
     *
     * La ingesta social continúa siendo
     * independiente del Constructor.
     */
    showAlert(
      'Consulta guardada correctamente.',
      'success'
    );

    return row;
  }

};