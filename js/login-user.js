// API URL para login
const AUTH_API_URL = 'https://dummyjson.com/auth/login';

// chequea si el usuario y password son correctos usando la API de DummyJSON
async function validarLogin(usuario, password) {
    try {
        const response = await fetch(AUTH_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: usuario,
                password: password
            })
        });

        if (!response.ok) {
            return { exito: false, error: "Usuario o contraseña incorrectos" };
        }

        const data = await response.json();

        // guarda el accessToken en sessionStorage
        sessionStorage.setItem('accessToken', data.accessToken);

        // guarda la sesion en localStorage
        const sesion = {
            usuario: data.username,
            nombre: data.firstName + ' ' + data.lastName,
            token: data.token,
            refreshToken: data.refreshToken,
            id: data.id,
            loginTime: new Date().getTime(),
            activo: true
        };
        localStorage.setItem('sesionAdmin', JSON.stringify(sesion));
        return { exito: true, usuario: data };
    } catch (error) {
        console.error('Error en la solicitud de login:', error);
        return { exito: false, error: "Error al conectar con el servidor" };
    }
}

// verifica si hay una sesion activa
function verificarSesion() {
    const sesionGuardada = localStorage.getItem('sesionAdmin');

    if (!sesionGuardada) {
        return { activa: false, error: "No hay sesion activa" };
    }

    const sesion = JSON.parse(sesionGuardada);

    // checa si la sesion expiro (24 horas)
    const tiempoActual = new Date().getTime();
    const tiempoExpiracion = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

    if (tiempoActual - sesion.loginTime > tiempoExpiracion) {
        cerrarSesion();
        return { activa: false, error: "Sesion expirada" };
    }

    return { activa: true, sesion: sesion };
}

// cierra la sesion
function cerrarSesion() {
    localStorage.removeItem('sesionAdmin');
    sessionStorage.removeItem('accessToken');
    window.location.href = 'admin.html';
}

// redirige a login si no hay sesion
function requiereSesion() {
    const verificacion = verificarSesion();
    if (!verificacion.activa) {
        window.location.href = 'admin.html';
        return false;
    }
    return true;
}