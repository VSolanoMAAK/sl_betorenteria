export default {
    cleanup: async function () {
        return await q_ws_delete_source.run({
            id: "e5357911-a188-45b5-b5d1-e91973346e7d"
        });
    }
}