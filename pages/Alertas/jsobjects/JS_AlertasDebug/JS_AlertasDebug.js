export default {
  diagnosticar: function () {
    const modelo = CustomWidget1.model || {};
    const valor = modelo.alertsJson;

    let registrosModelo = null;
    let errorParseo = null;

    if (Array.isArray(valor)) {
      registrosModelo = valor.length;
    } else if (typeof valor === 'string') {
      try {
        const datos = JSON.parse(valor);
        registrosModelo = Array.isArray(datos) ? datos.length : null;
      } catch (error) {
        errorParseo = error.message;
      }
    }

    return {
      registrosConsulta: Array.isArray(q_alerts_list.data)
        ? q_alerts_list.data.length
        : null,
      propiedadesModelo: Object.keys(modelo),
      tipoAlertsJson: typeof valor,
      longitudAlertsJson: typeof valor === 'string'
        ? valor.length
        : null,
      registrosModelo: registrosModelo,
      errorParseo: errorParseo
    };
  }
};