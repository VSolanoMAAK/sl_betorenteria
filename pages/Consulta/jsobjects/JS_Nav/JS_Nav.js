export default {
  go: async function () {
    var map = {
      dashboard: 'Dashboard',
      mentions: 'Menciones',
      analytics: 'Analitica',
      competitors: 'Competencia',
      targets: 'Objetivos',
      alerts: 'Alertas',
      reports: 'Reportes',
      tasks: 'TareasScrapeo',
      integrations: 'Integraciones',
      users: 'Usuarios',
      roles: 'RolesPermisos',
      audit: 'Auditoria',
      settings: 'Configuracion',
      billing: 'Plan'
    };

    var target = CustomWidget.model.navTo;
    var tries = 0;

    while (!target && tries < 10) {
      await new Promise(function (r) { setTimeout(r, 100); });
      target = CustomWidget.model.navTo;
      tries++;
    }

    if (target && map[target]) {
      navigateTo(map[target]);
    }
  }
}