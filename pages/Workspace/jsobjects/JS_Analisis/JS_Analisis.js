export default {

  loadData: async () => {
    try {
      const widgetModel =
        CW_Analisis.model || {};

      const rawPeriodDays =
        Number(
          widgetModel.periodDays
        );

      const rawPlatform =
        String(
          widgetModel.platform || 'all'
        )
          .trim()
          .toLowerCase();

      const rawSelectedQueryId =
        String(
          widgetModel.selectedQueryId || ''
        )
          .trim();

      const rawSelectedQueryName =
        String(
          widgetModel.selectedQueryName || ''
        )
          .trim();

      const allowedPlatforms = [
        'all',
        'facebook',
        'instagram',
        'tiktok',
        'threads'
      ];

      const filters = {
        periodDays:
          Number.isFinite(rawPeriodDays) &&
          rawPeriodDays > 0
            ? rawPeriodDays
            : 30,

        platform:
          allowedPlatforms.includes(
            rawPlatform
          )
            ? rawPlatform
            : 'all',

        selectedQueryId:
          rawSelectedQueryId,

        selectedQueryName:
          rawSelectedQueryName
      };

      await storeValue(
        'analisisFilters',
        filters,
        false
      );

      await storeValue(
        'analisisRuntime',
        {
          queries: [],

          estado: null,
          palancas: [],
          formatos: [],
          evidencias: [],

          meta: {
            loading: true,
            empty: false,
            error: '',
            generatedAt: null
          }
        },
        false
      );

      const queryResult =
        await Q_AnalisisConsultas.run();

      const queries =
        Array.isArray(queryResult)
          ? queryResult
          : [];

      const selectedQuery =
        queries.find(
          (query) =>
            String(
              query.id || ''
            ) ===
            rawSelectedQueryId
        ) || null;

      if (selectedQuery) {
        filters.selectedQueryId =
          String(
            selectedQuery.id || ''
          );

        filters.selectedQueryName =
          String(
            selectedQuery.name || ''
          );

        await storeValue(
          'analisisFilters',
          filters,
          false
        );
      }

      const results =
        await Promise.all([
          Q_AnalisisEstado.run(),
          Q_AnalisisPalancas.run(),
          Q_AnalisisFormatos.run(),
          Q_AnalisisEvidencias.run()
        ]);

      const payload = {
        queries:
          queries,

        estado:
          Array.isArray(results[0]) &&
          results[0].length > 0
            ? results[0][0]
            : null,

        palancas:
          Array.isArray(results[1])
            ? results[1]
            : [],

        formatos:
          Array.isArray(results[2])
            ? results[2]
            : [],

        evidencias:
          Array.isArray(results[3])
            ? results[3]
            : [],

        meta: {
          loading: false,

          empty:
            !(
              Array.isArray(results[1]) &&
              results[1].length > 0
            ),

          error: '',

          generatedAt:
            new Date().toISOString()
        }
      };

      await storeValue(
        'analisisRuntime',
        payload,
        false
      );

      return payload;

    } catch (error) {
      const message =
        error &&
        error.message
          ? error.message
          : String(error);

      await storeValue(
        'analisisRuntime',
        {
          queries: [],

          estado: null,
          palancas: [],
          formatos: [],
          evidencias: [],

          meta: {
            loading: false,
            empty: false,
            error: message,
            generatedAt:
              new Date().toISOString()
          }
        },
        false
      );

      showAlert(
        'No fue posible cargar el análisis: ' +
          message,
        'error'
      );

      throw error;
    }
  }

};