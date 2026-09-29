export default {

  async rerunSelectedQuery() {

    const queryId =
      appsmith.store.selectedQueryId ||
      "";

    if (!queryId) {
      showAlert(
        "Selecciona una consulta antes de re-ejecutarla.",
        "warning"
      );

      return {
        ok: false,
        reason: "no_query_selected"
      };
    }

    const queries =
      Array.isArray(q_ws_list_queries.data)
        ? q_ws_list_queries.data
        : [];

    const selectedQuery =
      queries.find(
        query =>
          String(query.id || "") ===
          String(queryId)
      );

    if (!selectedQuery) {
      showAlert(
        "No fue posible localizar la consulta seleccionada.",
        "error"
      );

      return {
        ok: false,
        reason: "query_not_found"
      };
    }

    if (selectedQuery.use_web !== true) {
      showAlert(
        "Esta consulta no tiene búsqueda WEB habilitada. La re-ejecución de fuentes sociales se incorporará en su flujo correspondiente.",
        "warning"
      );

      return {
        ok: false,
        reason: "web_disabled"
      };
    }

    try {

      showAlert(
        "Re-ejecutando la consulta WEB...",
        "info"
      );

      const searchResult =
        await q_ws_web_search_v2.run();

      const mentionsResult =
        await q_ws_list_web_mentions.run();

      showAlert(
        "Consulta re-ejecutada correctamente.",
        "success"
      );

      return {
        ok: true,
        queryId: queryId,
        queryName: selectedQuery.name || "",
        searchResult: searchResult,
        mentionsCount:
          Array.isArray(mentionsResult)
            ? mentionsResult.length
            : 0
      };

    } catch (error) {

      showAlert(
        "No fue posible re-ejecutar la consulta.",
        "error"
      );

      return {
        ok: false,
        reason: "execution_error",
        message:
          error && error.message
            ? error.message
            : String(error)
      };
    }
  },


  async toggleSelectedQueryStatus() {

    const queryId =
      appsmith.store.selectedQueryId ||
      "";

    if (!queryId) {
      showAlert(
        "Selecciona una consulta antes de cambiar su estado.",
        "warning"
      );

      return {
        ok: false,
        reason: "no_query_selected"
      };
    }

    try {

      const result =
        await q_ws_toggle_query_status.run();

      if (
        !Array.isArray(result) ||
        result.length === 0
      ) {
        showAlert(
          "No fue posible cambiar el estado de la consulta.",
          "error"
        );

        return {
          ok: false,
          reason: "query_not_updated"
        };
      }

      const updated =
        result[0];

      await q_ws_list_queries.run();

      showAlert(
        updated.status === "active"
          ? "Consulta activada correctamente."
          : "Consulta desactivada correctamente.",
        "success"
      );

      return {
        ok: true,
        queryId: updated.id,
        queryName: updated.name,
        status: updated.status
      };

    } catch (error) {

      showAlert(
        "No fue posible cambiar el estado de la consulta.",
        "error"
      );

      return {
        ok: false,
        reason: "execution_error",
        message:
          error && error.message
            ? error.message
            : String(error)
      };
    }
  }

}