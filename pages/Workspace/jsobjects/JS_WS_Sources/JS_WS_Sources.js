export default {
    getState: function () {
        var model =
            CW_Constructor.model || {};

        return {
            page: Math.max(
                Number(
                    model.sourcePage || 1
                ),
                1
            ),

            pageSize: Math.min(
                Math.max(
                    Number(
                        model.sourcePageSize || 25
                    ),
                    1
                ),
                100
            ),

            search: String(
                model.sourceSearch || ''
            ).trim(),

            platform: String(
                model.sourcePlatformFilter || ''
            ).trim(),

            status: String(
                model.sourceStatusFilter || ''
            ).trim(),

            formPlatform: String(
                model.sourceFormPlatform || ''
            ).trim(),

            formHandle: String(
                model.sourceFormHandle || ''
            ).trim(),

            formExternalId: String(
                model.sourceFormExternalId || ''
            ).trim(),

            actionId: String(
                model.sourceActionId || ''
            ).trim()
        };
    },

    loadSources: async function () {
        var state =
            JS_WS_Sources.getState();

        try {
            return await q_ws_list_sources.run({
                page:
                    state.page,

                page_size:
                    state.pageSize,

                search:
                    state.search,

                platform:
                    state.platform,

                status:
                    state.status
            });
        } catch (error) {
            showAlert(
                'No fue posible cargar las fuentes.',
                'error'
            );

            throw error;
        }
    },

    refreshSourcesAndTargets: async function () {
        try {
            await q_ws_list_targets.run();

            return await JS_WS_Sources.loadSources();
        } catch (error) {
            showAlert(
                'No fue posible actualizar las fuentes.',
                'error'
            );

            throw error;
        }
    },

    createSource: async function () {
        var state =
            JS_WS_Sources.getState();

        if (!state.formPlatform) {
            showAlert(
                'Selecciona una plataforma.',
                'warning'
            );

            return [];
        }

        if (!state.formHandle) {
            showAlert(
                'Ingresa el handle de la fuente.',
                'warning'
            );

            return [];
        }

        if (!state.formExternalId) {
            showAlert(
                'Ingresa el External ID de la fuente.',
                'warning'
            );

            return [];
        }

        try {
            var created =
                await q_ws_create_source.run({
                    platform:
                        state.formPlatform,

                    external_profile_id:
                        state.formExternalId,

                    handle:
                        state.formHandle
                });

            if (
                !Array.isArray(created) ||
                created.length === 0
            ) {
                showAlert(
                    'La fuente ya existe o la plataforma no está habilitada para el monitoreo actual.',
                    'warning'
                );

                return [];
            }

            await JS_WS_Sources.refreshSourcesAndTargets();

            showAlert(
                'Fuente registrada correctamente.',
                'success'
            );

            return created;
        } catch (error) {
            showAlert(
                'No fue posible registrar la fuente.',
                'error'
            );

            throw error;
        }
    },

    toggleSource: async function () {
        var state =
            JS_WS_Sources.getState();

        if (!state.actionId) {
            showAlert(
                'No se identificó la fuente.',
                'error'
            );

            return [];
        }

        try {
            var updated =
                await q_ws_toggle_source.run({
                    id:
                        state.actionId
                });

            if (
                !Array.isArray(updated) ||
                updated.length === 0
            ) {
                showAlert(
                    'La fuente no pudo actualizarse.',
                    'warning'
                );

                return [];
            }

            await JS_WS_Sources.refreshSourcesAndTargets();

            showAlert(
                updated[0].status === 'active'
                    ? 'Fuente activada correctamente.'
                    : 'Fuente desactivada correctamente.',
                'success'
            );

            return updated;
        } catch (error) {
            showAlert(
                'No fue posible cambiar el estado de la fuente.',
                'error'
            );

            throw error;
        }
    },

    deleteSource: async function () {
        var state =
            JS_WS_Sources.getState();

        if (!state.actionId) {
            showAlert(
                'No se identificó la fuente.',
                'error'
            );

            return [];
        }

        try {
            var deleted =
                await q_ws_delete_source.run({
                    id:
                        state.actionId
                });

            if (
                !Array.isArray(deleted) ||
                deleted.length === 0
            ) {
                showAlert(
                    'La fuente no pudo eliminarse.',
                    'warning'
                );

                return [];
            }

            await JS_WS_Sources.refreshSourcesAndTargets();

            showAlert(
                'Fuente eliminada correctamente.',
                'success'
            );

            return deleted;
        } catch (error) {
            showAlert(
                'No fue posible eliminar la fuente.',
                'error'
            );

            throw error;
        }
    }
}