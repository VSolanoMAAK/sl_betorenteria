export default {

  loadData: async function () {
    try {

      let queries = [];
      let targets = [];


      /*
       * q_ws_list_queries puede ser una Query
       * ejecutable o un objeto que ya expone
       * sus datos.
       *
       * Si tiene run(), se ejecuta.
       * Si no, se utiliza data sin provocar
       * un error falso.
       */
      if (
        q_ws_list_queries &&
        typeof q_ws_list_queries.run === 'function'
      ) {
        const result =
          await q_ws_list_queries.run();

        queries =
          Array.isArray(result)
            ? result
            : [];

      } else if (
        q_ws_list_queries &&
        Array.isArray(q_ws_list_queries.data)
      ) {
        queries =
          q_ws_list_queries.data;
      }


      /*
       * Mismo tratamiento defensivo para
       * el catálogo de objetivos.
       */
      if (
        q_ws_list_targets &&
        typeof q_ws_list_targets.run === 'function'
      ) {
        const result =
          await q_ws_list_targets.run();

        targets =
          Array.isArray(result)
            ? result
            : [];

      } else if (
        q_ws_list_targets &&
        Array.isArray(q_ws_list_targets.data)
      ) {
        targets =
          q_ws_list_targets.data;
      }


      return {
        queries:
          queries,

        targets:
          targets
      };

    } catch (error) {

      const message =
        String(
          error &&
          error.message
            ? error.message
            : error
        );

      showAlert(
        'Error cargando el Constructor: ' +
          message,
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
     * Se mantienen también activeQueryId /
     * activeQueryName por compatibilidad
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

    } catch (error) {

      const message =
        String(
          error &&
          error.message
            ? error.message
            : error
        );

      showAlert(
        'La consulta fue guardada, pero no fue posible guardar su selección local: ' +
          message,
        'warning'
      );

      return row;
    }


    /*
     * Refrescar el listado solamente cuando
     * q_ws_list_queries sea realmente una
     * Query/API ejecutable.
     *
     * NO convertir un problema de refresco
     * en un supuesto fallo de creación.
     */
    try {

      if (
        q_ws_list_queries &&
        typeof q_ws_list_queries.run === 'function'
      ) {
        await q_ws_list_queries.run();
      }

    } catch (error) {

      console.error(
        'La consulta fue creada correctamente, pero el listado no pudo refrescarse:',
        error
      );
    }


    /*
     * Una consulta WEB activa ejecuta
     * inmediatamente su primera búsqueda.
     *
     * La creación de la consulta ya genera:
     *
     * - sl_web_keywords
     * - sl_query_web_keywords
     *
     * por lo que q_ws_web_search_v2 puede
     * trabajar con queryId.
     */
    if (
      useWeb &&
      queryStatus === 'active'
    ) {
      try {

        if (
          !q_ws_web_search_v2 ||
          typeof q_ws_web_search_v2.run !== 'function'
        ) {
          throw new Error(
            'q_ws_web_search_v2 no está disponible como acción ejecutable.'
          );
        }


        await q_ws_web_search_v2.run();


        /*
         * Refrescar menciones WEB solamente
         * si la acción expone run().
         */
        if (
          q_ws_list_web_mentions &&
          typeof q_ws_list_web_mentions.run === 'function'
        ) {
          await q_ws_list_web_mentions.run();
        }


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
              : error
          );

        /*
         * La consulta YA fue guardada.
         * Un fallo de búsqueda WEB no debe
         * presentarse como fallo de creación.
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