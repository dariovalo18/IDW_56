document.addEventListener('DOMContentLoaded', () => {
    // si ya hay sesion activa, redirigir al panel
    const verificacion = verificarSesion();
    if (verificacion.activa) {
        window.location.href = 'admin-medicos.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // mostrar loading
        loginText.textContent = 'Verificando...';
        loginSpinner.classList.remove('d-none');
        errorMessage.style.display = 'none';

        const usuario = document.getElementById('usuario').value;
        const password = document.getElementById('password').value;

        try {
            const resultado = await validarLogin(usuario, password);

            if (resultado.exito) {
                // login exitoso
                loginText.textContent = 'Acceso concedido!';
                setTimeout(() => {
                    window.location.href = 'admin-medicos.html';
                }, 1000);
            } else {
                // login fallido
                errorMessage.textContent = resultado.error;
                errorMessage.style.display = 'block';
                loginText.textContent = 'Iniciar Sesión';
                loginSpinner.classList.add('d-none');
            }
        } catch (error) {
            console.error('Error durante el login:', error);
            errorMessage.textContent = 'Error al procesar el login';
            errorMessage.style.display = 'block';
            loginText.textContent = 'Iniciar Sesión';
            loginSpinner.classList.add('d-none');
        }
    });
});