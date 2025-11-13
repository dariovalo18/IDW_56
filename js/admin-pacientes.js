// URL de la API para obtener usuarios
const USUARIOS_API_URL = 'https://dummyjson.com/users';

// variable global para el modal
let modalDatosSensibles = null;

// almacena los usuarios en memoria para acceso rápido
let usuariosCache = {};

// obtiene los usuarios de la API de DummyJSON
async function obtenerUsuariosAPI() {
    try {
        const response = await fetch(USUARIOS_API_URL);
        if (!response.ok) {
            throw new Error('Error al obtener usuarios');
        }
        const data = await response.json();
        return data.users || [];
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return [];
    }
}

// filtra los datos para mostrar solo información pública y segura
function filtrarDatosUsuario(usuario) {
    return {
        id: usuario.id,
        image: usuario.image,
        firstName: usuario.firstName,
        lastName: usuario.lastName,
        username: usuario.username,
        ssn: usuario.ssn || 'N/A',
        gender: usuario.gender,
        age: usuario.age
    };
}

// obtiene datos sensibles del usuario
function obtenerDatosSensibles(usuario) {
    return {
        email: usuario.email || 'No disponible',
        phone: usuario.phone || 'No disponible',
        password: usuario.password || 'No disponible',
        company: usuario.company?.name || 'No disponible',
        address: `${usuario.address?.address || ''}, ${usuario.address?.city || ''}, ${usuario.address?.state || ''}`,
        ip: usuario.ip || 'No disponible',
        userAgent: usuario.userAgent || 'No disponible'
    };
}

// muestra el modal con los datos sensibles
function abrirModalDatosSensibles(usuarioId) {
    const usuario = usuariosCache[usuarioId];
    
    if (!usuario) {
        console.error('Usuario no encontrado:', usuarioId);
        return;
    }

    const datosPublicos = filtrarDatosUsuario(usuario);
    const datosSensibles = obtenerDatosSensibles(usuario);

    // llenar datos del usuario en el modal
    document.getElementById('usuarioFoto').src = datosPublicos.image;
    document.getElementById('usuarioNombreFull').textContent = `${datosPublicos.firstName} ${datosPublicos.lastName}`;

    // crear lista de datos sensibles con toggle
    const contenedor = document.getElementById('datosListaContainer');
    contenedor.innerHTML = '';

    const datosArray = [
        { label: '📧 Email', valor: datosSensibles.email, id: 'email' },
        { label: '📱 Teléfono', valor: datosSensibles.phone, id: 'phone' },
        { label: '🔑 Contraseña', valor: datosSensibles.password, id: 'password' },
        { label: '🏢 Empresa', valor: datosSensibles.company, id: 'company' },
        { label: '📍 Dirección', valor: datosSensibles.address, id: 'address' },
        { label: '🌐 IP', valor: datosSensibles.ip, id: 'ip' },
        { label: '🔧 User Agent', valor: datosSensibles.userAgent, id: 'userAgent' }
    ];

    datosArray.forEach(dato => {
        const div = document.createElement('div');
        div.className = 'mb-3 p-2 border rounded';
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <strong>${dato.label}</strong>
                    <div class="dato-valor" id="valor-${dato.id}" style="display: none; margin-top: 0.5rem;">
                        <small class="text-break text-muted">${dato.valor}</small>
                    </div>
                </div>
                <button class="btn btn-sm btn-outline-primary ms-2 btn-toggle-dato" data-dato-id="${dato.id}">
                    <span class="ver-texto">Ver</span>
                    <span class="ocultar-texto d-none">Ocultar</span>
                </button>
            </div>
        `;
        contenedor.appendChild(div);

        // agregar event listener al botón
        const btnToggle = div.querySelector('.btn-toggle-dato');
        btnToggle.addEventListener('click', (e) => {
            const datoId = e.target.closest('button').getAttribute('data-dato-id');
            toggleDato(datoId);
        });
    });

    modalDatosSensibles.show();
}

// alterna entre mostrar/ocultar un dato
function toggleDato(datoId) {
    const valorDiv = document.getElementById(`valor-${datoId}`);
    const boton = document.querySelector(`[data-dato-id="${datoId}"]`);
    const verTexto = boton.querySelector('.ver-texto');
    const ocultarTexto = boton.querySelector('.ocultar-texto');

    if (valorDiv.style.display === 'none') {
        // mostrar
        valorDiv.style.display = 'block';
        verTexto.classList.add('d-none');
        ocultarTexto.classList.remove('d-none');
        boton.classList.remove('btn-outline-primary');
        boton.classList.add('btn-primary');
    } else {
        // ocultar
        valorDiv.style.display = 'none';
        verTexto.classList.remove('d-none');
        ocultarTexto.classList.add('d-none');
        boton.classList.add('btn-outline-primary');
        boton.classList.remove('btn-primary');
    }
}

// carga y muestra la tabla con pacientes
async function cargarTablaPacientes() {
    const tbody = document.getElementById('tablaPacientes');
    
    try {
        const usuarios = await obtenerUsuariosAPI();

        if (!usuarios || usuarios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        No se encontraron pacientes
                    </td>
                </tr>
            `;
            return;
        }

        // filtrar solo pacientes (role: "user")
        const pacientes = usuarios.filter(u => u.role === 'user');

        if (pacientes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        No hay pacientes registrados
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = '';

        pacientes.forEach(usuario => {
            const datosLimpios = filtrarDatosUsuario(usuario);
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${datosLimpios.id}</td>
                <td>
                    <img src="${datosLimpios.image}" alt="${datosLimpios.firstName} ${datosLimpios.lastName}" 
                         class="preview-img" 
                         onerror="this.src='img/default-doctor.jpg'; this.alt='Imagen no disponible';">
                </td>
                <td>${datosLimpios.firstName} ${datosLimpios.lastName}</td>
                <td><code>${datosLimpios.username}</code></td>
                <td><small class="text-muted">${datosLimpios.ssn}</small></td>
                <td>
                    <span class="badge ${datosLimpios.gender === 'male' ? 'bg-primary' : 'bg-danger'}">
                        ${datosLimpios.gender === 'male' ? 'Masculino' : 'Femenino'}
                    </span>
                </td>
                <td>${datosLimpios.age} años</td>
                <td>
                    <button class="btn btn-sm btn-warning btn-ver-datos" data-user-id="${datosLimpios.id}">
                        Ver más datos
                    </button>
                </td>
            `;
            tbody.appendChild(fila);

            // agregar el usuario al cache
            usuariosCache[usuario.id] = usuario;

            // agregar event listener al botón
            const btnVerDatos = fila.querySelector('.btn-ver-datos');
            btnVerDatos.addEventListener('click', (e) => {
                const usuarioId = e.target.getAttribute('data-user-id');
                abrirModalDatosSensibles(usuarioId);
            });
        });
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Error al cargar los pacientes. Intenta nuevamente.
                </td>
            </tr>
        `;
    }
}

// inicializa la página
document.addEventListener('DOMContentLoaded', () => {
    // inicializar modal
    modalDatosSensibles = new bootstrap.Modal(document.getElementById('modalDatosSensibles'));

    // primero verificar sesión
    if (!requiereSesion()) {
        return;
    }

    const verificacion = verificarSesion();
    if (verificacion.activa) {
        document.getElementById('nombreUsuario').textContent = verificacion.sesion.nombre;
    }

    // cargar pacientes
    cargarTablaPacientes();
});

// función para cerrar sesión desde el botón
function cerrarSesionAdmin() {
    if (confirm('¿Seguro que quieres cerrar la sesión?')) {
        cerrarSesion();
    }
}
