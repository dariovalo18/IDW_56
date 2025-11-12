document.addEventListener('DOMContentLoaded', () => {
    // si ya hay sesion activa, redirigir al panel según rol SOLO si está en admin.html
    const paginaActual = window.location.pathname.split('/').pop() || 'admin.html';
    
    // Solo hacer redirección automática si está en admin.html
    if (paginaActual === 'admin.html' || paginaActual === '') {
        const verificacion = verificarSesion();
        if (verificacion.activa) {
            const sesion = JSON.parse(localStorage.getItem('sesion') || '{}');
            console.log('Sesion activa detectada en admin.html:', sesion);
            
            // Si es admin, dejar acceder al formulario de login
            if (sesion.role === 'admin') {
                console.log('Admin detectado, permitir acceso a admin.html');
                return;
            }
            
            // Si es paciente, redirigir apropiadamente
            if (sesion.role !== 'admin') {
                if (!sesion.obraSocialId) {
                    console.log('Paciente sin obra social, redirigiendo a selección');
                    window.location.href = 'seleccionar-obra-social.html';
                } else {
                    console.log('Paciente logueado, redirigiendo a agendar turnos');
                    window.location.href = 'paciente-agendar.html';
                }
                return;
            }
        }
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
            console.log('Resultado del login:', resultado);

            if (resultado.exito) {
                // login exitoso
                loginText.textContent = 'Acceso concedido!';
                
                // redirigir según rol del usuario
                const sesion = JSON.parse(localStorage.getItem('sesion') || '{}');
                console.log('Sesion después del login:', sesion);
                
                // Si es paciente, ir a seleccionar obra social
                if (sesion.role !== 'admin') {
                    console.log('Redirigiendo paciente a selección de obra social');
                    setTimeout(() => {
                        window.location.href = 'seleccionar-obra-social.html';
                    }, 1000);
                } else {
                    // Si es admin, ir al panel de administración
                    const destino = 'admin-medicos.html';
                    console.log('Redirigiendo admin a:', destino);
                    setTimeout(() => {
                        window.location.href = destino;
                    }, 1000);
                }
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