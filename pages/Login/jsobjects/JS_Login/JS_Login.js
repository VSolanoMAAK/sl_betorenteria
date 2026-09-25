export default {
  checkAndLogin: async function () {
    var email = CustomWidget1.model.loginEmail;
    if (!email) { return; }

    var result = await q_get_user_permissions.run({ email: email });

    if (result && result.length > 0) {
      var isAdmin = false;
      for (var i = 0; i < result.length; i++) {
        if (result[i].resource === 'users' && result[i].action === 'manage') {
          isAdmin = true;
        }
      }
      storeValue('userEmail', email);
      storeValue('userRole', isAdmin ? 'admin' : 'viewer');
      showAlert('Acceso concedido. Bienvenido.', 'success');
      navigateTo('Dashboard');
    } else {
      showAlert('Usuario no encontrado o sin permisos', 'error');
    }
  }
}