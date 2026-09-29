export default {
    testToggleSource: async function () {
        const suffix = Date.now().toString();

        const externalId =
            "prueba_toggle_" + suffix;

        const created =
            await q_ws_create_source.run({
                platform: "instagram",
                external_profile_id: externalId,
                handle: externalId
            });

        if (
            !Array.isArray(created) ||
            created.length === 0 ||
            !created[0].id
        ) {
            return {
                ok: false,
                stage: "create",
                created: created
            };
        }

        const toggled =
            await q_ws_toggle_source.run({
                id: created[0].id
            });

        return {
            ok:
                Array.isArray(toggled) &&
                toggled.length > 0 &&
                toggled[0].status === "inactive",

            created: created[0],
            toggled:
                Array.isArray(toggled) &&
                toggled.length > 0
                    ? toggled[0]
                    : null
        };
    }
}