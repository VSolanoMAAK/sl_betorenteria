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

          insight: null,

          meta: {
            loading: true,
            empty: false,
            error: '',
            generatedAt: null,

            insightLoading:
              Boolean(
                rawSelectedQueryId
              ),

            insightError: '',
            insightGeneratedAt: null
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

      const deterministicPayload = {
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

        insight:
          null,

        meta: {
          loading: false,

          empty:
            !(
              Array.isArray(results[1]) &&
              results[1].length > 0
            ),

          error: '',

          generatedAt:
            new Date().toISOString(),

          insightLoading:
            Boolean(
              selectedQuery
            ),

          insightError: '',
          insightGeneratedAt: null
        }
      };

      await storeValue(
        'analisisRuntime',
        deterministicPayload,
        false
      );

      if (!selectedQuery) {
        return deterministicPayload;
      }

      try {
        const insightResult =
          await Q_AnalisisInsight.run();

        const insightEnvelope =
          Array.isArray(insightResult)
            ? (
                insightResult.length > 0
                  ? insightResult[0]
                  : null
              )
            : (
                insightResult &&
                typeof insightResult === 'object'
                  ? insightResult
                  : null
              );

        const recommendations =
          insightEnvelope &&
          insightEnvelope.recommendations &&
          typeof insightEnvelope.recommendations === 'object' &&
          !Array.isArray(
            insightEnvelope.recommendations
          )
            ? insightEnvelope.recommendations
            : null;

        if (
          !insightEnvelope ||
          insightEnvelope.ok !== true ||
          !recommendations
        ) {
          const insightMessage =
            insightEnvelope &&
            insightEnvelope.error &&
            insightEnvelope.error.message
              ? String(
                  insightEnvelope.error.message
                )
              : 'No fue posible generar las recomendaciones de IA.';

          const payloadWithInsightError = {
            ...deterministicPayload,

            insight:
              null,

            meta: {
              ...deterministicPayload.meta,

              insightLoading:
                false,

              insightError:
                insightMessage,

              insightGeneratedAt:
                null
            }
          };

          await storeValue(
            'analisisRuntime',
            payloadWithInsightError,
            false
          );

          return payloadWithInsightError;
        }

        const insight = {
          id:
            String(
              insightEnvelope.insight_id || ''
            ),

          cached:
            insightEnvelope.cached === true,

          queryId:
            String(
              insightEnvelope.query_id || ''
            ),

          queryName:
            String(
              insightEnvelope.query_name || ''
            ),

          sourceRunId:
            String(
              insightEnvelope.source_run_id || ''
            ),

          analysisKind:
            String(
              insightEnvelope.analysis_kind || ''
            ),

          inputHash:
            String(
              insightEnvelope.input_hash || ''
            ),

          modelName:
            String(
              insightEnvelope.model_name || ''
            ),

          promptVersion:
            String(
              insightEnvelope.prompt_version || ''
            ),

          generatedAt:
            insightEnvelope.generated_at || null,

          recommendations:
            recommendations
        };

        const finalPayload = {
          ...deterministicPayload,

          insight:
            insight,

          meta: {
            ...deterministicPayload.meta,

            insightLoading:
              false,

            insightError:
              '',

            insightGeneratedAt:
              insight.generatedAt
          }
        };

        await storeValue(
          'analisisRuntime',
          finalPayload,
          false
        );

        return finalPayload;

      } catch (insightError) {
        const insightMessage =
          insightError &&
          insightError.message
            ? insightError.message
            : String(insightError);

        const payloadWithInsightError = {
          ...deterministicPayload,

          insight:
            null,

          meta: {
            ...deterministicPayload.meta,

            insightLoading:
              false,

            insightError:
              insightMessage,

            insightGeneratedAt:
              null
          }
        };

        await storeValue(
          'analisisRuntime',
          payloadWithInsightError,
          false
        );

        return payloadWithInsightError;
      }

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

          insight: null,

          meta: {
            loading: false,
            empty: false,
            error: message,
            generatedAt:
              new Date().toISOString(),

            insightLoading:
              false,

            insightError: '',
            insightGeneratedAt: null
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