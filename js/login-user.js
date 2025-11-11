// datos de usuarios para el login
const usuariosAdmin = {
    usuarios: [
        {
            id: 1,
            usuario: "admin",
            password: "123456",
            nombre: "Administrador Principal"
        },
        {
            id: 2,
            usuario: "medico",
            password: "medico123",
            nombre: "Dr. Administrador"
        }
    ]
};

// chequea si el usuario y password son correctos
function validarLogin(usuario, password) {
    const usuarioEncontrado = usuariosAdmin.usuarios.find(u =>
        u.usuario === usuario && u.password === password
    );

    if (usuarioEncontrado) {
        // guarda la sesion en localStorage
        const sesion = {
            usuario: usuarioEncontrado.usuario,
            nombre: usuarioEncontrado.nombre,
            loginTime: new Date().getTime(),
            activo: true
        };
        localStorage.setItem('sesionAdmin', JSON.stringify(sesion));
        return { exito: true, usuario: usuarioEncontrado };
    }

    return { exito: false, error: "Usuario o contraseña incorrectos" };
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