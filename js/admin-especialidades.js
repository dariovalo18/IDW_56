// variables globales para el admin
let especialidadEditandoId = null;
let modalEspecialidad = null;
let modalEliminar = null; // Usaremos el mismo modal de eliminar

// inicializar modales cuando se carga la pagina
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar los datos base si no existen
    inicializarEspecialidades();
    
    // Cargar la tabla
    cargarTablaEspecialidades();

    // Vincular los modales
    modalEspecialidad = new bootstrap.Modal(document.getElementById('modalEspecialidad'));
    modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminar'));
});

// carga la tabla con todas las especialidades
function cargarTablaEspecialidades() {
    const datos = obtenerEspecialidades();
    const tbody = document.getElementById('tablaEspecialidades');

    tbody.innerHTML = '';

    if (datos.especialidades.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted">
                    No hay especialidades registradas. <a href="#" onclick="abrirModalAgregar()">Agregar la primera</a>
                </td>
            </tr>
        `;
        return;
    }

    datos.especialidades.forEach(especialidad => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${especialidad.id}</td>
            <td>${especialidad.nombre}</td>
            <td>
                <button class="btn btn-warning btn-action" onclick="abrirModalEditar(${especialidad.id})" title="Editar">
                    Editar
                </button>
                <button class="btn btn-danger btn-action" onclick="abrirModalEliminar(${especialidad.id})" title="Eliminar">
                    Eliminar
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// abre el modal para agregar una especialidad nueva
function abrirModalAgregar() {
    especialidadEditandoId = null;
    document.getElementById('modalTitulo').textContent = 'Agregar Especialidad';
    document.getElementById('formEspecialidad').reset();
    modalEspecialidad.show();
}

// abre el modal para editar una especialidad existente
function abrirModalEditar(id) {
    const datos = obtenerEspecialidades();
    const especialidad = datos.especialidades.find(e => e.id === id);

    if (!especialidad) {
        alert('No se encontro la especialidad');
        return;
    }

    especialidadEditandoId = id;
    document.getElementById('modalTitulo').textContent = 'Editar Especialidad';

    // llenar el formulario con los datos actuales
    document.getElementById('especialidadId').value = especialidad.id;
    document.getElementById('especialidadNombre').value = especialidad.nombre;

    modalEspecialidad.show();
}

// guarda la especialidad (nueva o editada)
function guardarEspecialidad() {
    const form = document.getElementById('formEspecialidad');

    // validar formulario
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // mostrar loading
    const btnTexto = document.getElementById('btnGuardarTexto');
    const btnSpinner = document.getElementById('btnGuardarSpinner');
    btnTexto.textContent = 'Guardando...';
    btnSpinner.classList.remove('d-none');

    // obtener datos del formulario
    const datosFormulario = new FormData(form);
    const nuevaEspecialidad = {
        nombre: datosFormulario.get('nombre')
    };

    // simular delay para el loading
    setTimeout(() => {
        try {
            if (especialidadEditandoId) {
                // editar especialidad existente
                actualizarEspecialidad(especialidadEditandoId, nuevaEspecialidad);
                mostrarNotificacion('Especialidad actualizada correctamente', 'success');
            } else {
                // agregar especialidad nueva
                agregarEspecialidad(nuevaEspecialidad);
                mostrarNotificacion('Especialidad agregada correctamente', 'success');
            }

            // recargar tabla y cerrar modal
            cargarTablaEspecialidades();
            modalEspecialidad.hide();

        } catch (error) {
            mostrarNotificacion('Error al guardar la especialidad', 'error');
        } finally {
            // restaurar boton
            btnTexto.textContent = 'Guardar';
            btnSpinner.classList.add('d-none');
        }
    }, 800);
}

// abre el modal de confirmacion para eliminar
function abrirModalEliminar(id) {
    const datos = obtenerEspecialidades();
    const especialidad = datos.especialidades.find(e => e.id === id);

    if (!especialidad) {
        alert('No se encontro la especialidad');
        return;
    }

    especialidadEditandoId = id;
    // Usamos el ID del modal de eliminar genérico
    document.getElementById('especialidadEliminarNombre').textContent = especialidad.nombre;
    modalEliminar.show();
}

// confirma y ejecuta la eliminacion
function confirmarEliminar() {
    if (!especialidadEditandoId) {
        return;
    }

    try {
        eliminarEspecialidad(especialidadEditandoId);
        cargarTablaEspecialidades();
        modalEliminar.hide();
        mostrarNotificacion('Especialidad eliminada correctamente', 'success');
    } catch (error) {
        mostrarNotificacion('Error al eliminar la especialidad', 'error');
    }

    especialidadEditandoId = null;
}


// --- Funciones Utilitarias (Copiadas de admin-medicos.js) ---

// muestra notificaciones toast
function mostrarNotificacion(mensaje, tipo = 'success') {
    const toastContainer = document.getElementById('toastContainer') || crearContenedorToast();

    const toastId = 'toast-' + Date.now();
    const bgClass = tipo === 'success' ? 'bg-success' : 'bg-danger';

    const toastHtml = `
        <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
            <div class="toast-body">
                ${mensaje}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    const toast = new bootstrap.Toast(document.getElementById(toastId));
    toast.show();

    document.getElementById(toastId).addEventListener('hidden.bs.toast', function () {
        this.remove();
    });
}

// crea el contenedor de toasts si no existe
function crearContenedorToast() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1055';
    document.body.appendChild(container);
    return container;
}

// funcion para cerrar sesion desde el boton
function cerrarSesionAdmin() {
    if (confirm('¿Seguro que quieres cerrar la sesión?')) {
        cerrarSesion();
    }
}