export default {
  loadData: async function () {
    var d = Number(CustomWidget1.model.f_dias || 7);

    function utf8ToBinary(value) {
      var encoded = encodeURIComponent(value);

      return encoded.replace(
        /%([0-9A-F]{2})/g,
        function (match, hex) {
          return String.fromCharCode(
            parseInt(hex, 16)
          );
        }
      );
    }

    try {
      var k = await q_rep_kpis.run({
        dias: d
      });

      var pl = await q_rep_plataformas.run({
        dias: d
      });

      var tp = await q_rep_top.run({
        dias: d
      });

      var mn = await q_rep_menciones.run({
        dias: d
      });

      var payload = {
        dias: d,
        kpis: (k && k[0]) || {},
        plataformas: pl || [],
        top: tp || [],
        menciones: mn || []
      };

      var json = JSON.stringify(payload);

      var encodedReport = btoa(
        utf8ToBinary(json)
      );

      await storeValue(
        'reportJson',
        encodedReport,
        false
      );

    } catch (e) {
      showAlert(
        'Error reportes: ' + e.message,
        'error'
      );
    }
  }
}