// API URL para login
const AUTH_API_URL = 'https://dummyjson.com/auth/login';
const USERS_API_URL = 'https://dummyjson.com/users';

// chequea si el usuario y password son correctos usando la API de DummyJSON
async function validarLogin(usuario, password) {
    try {
        console.log('Intentando login con:', usuario);
        
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
            console.log('Login fallido:', response.status);
            return { exito: false, error: "Usuario o contraseña incorrectos" };
        }

        const data = await response.json();
        console.log('Login exitoso, obteniendo role...', data);

        // guarda el accessToken en sessionStorage
        sessionStorage.setItem('accessToken', data.accessToken);

        // obtener datos adicionales del usuario (incluyendo role y ssn)
        let rol = 'user'; // por defecto es 'user' (paciente)
        let ssn = 'N/A'; // por defecto
        try {
            const userResponse = await fetch(`${USERS_API_URL}/${data.id}`, {
                headers: {
                    'Authorization': `Bearer ${data.accessToken}`
                }
            });
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                rol = userData.role || 'user';
                ssn = userData.ssn || 'N/A';
                console.log('Role obtenido:', rol, 'SSN:', ssn);
            } else {
                console.log('No se pudo obtener datos del usuario, usando role por defecto');
            }
        } catch (e) {
            console.log('Error al obtener role adicional:', e);
        }

        // guarda la sesion en localStorage
        const sesion = {
            usuario: data.username,
            nombre: data.firstName + ' ' + data.lastName,
            firstName: data.firstName,
            lastName: data.lastName,
            token: data.token,
            refreshToken: data.refreshToken,
            id: data.id,
            role: rol,
            ssn: ssn,
            loginTime: new Date().getTime(),
            activo: true
        };
        
        console.log('Sesion guardada:', sesion);
        
        // guardar en ambos formatos para compatibilidad
        localStorage.setItem('sesion', JSON.stringify(sesion));
        localStorage.setItem('sesionAdmin', JSON.stringify(sesion));
        
        return { exito: true, usuario: data };
    } catch (error) {
        console.error('Error en la solicitud de login:', error);
        return { exito: false, error: "Error al conectar con el servidor" };
    }
}

// verifica si hay una sesion activa
function verificarSesion() {
    const sesionGuardada = localStorage.getItem('sesion') || localStorage.getItem('sesionAdmin');

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

// cierra la sesion y limpia todos los datos
function cerrarSesion() {
    // Limpiar sesión
    localStorage.removeItem('sesionAdmin');
    localStorage.removeItem('sesion');
    
    // Limpiar tokens
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('token');
    sessionStorage.clear(); // Limpiar todo sessionStorage
    
    // Limpiar datos de usuario si es necesario
    localStorage.removeItem('usuarioActual');
    
    // Redirigir a login
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