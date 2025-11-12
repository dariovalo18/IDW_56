// variables globales para admin de horarios
let horarioEditandoId = null;
let modalHorario = null;
let modalEliminarHorario = null;
let medicos = [];
let filtroMedicoId = null;

// inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    modalHorario = new bootstrap.Modal(document.getElementById('modalHorario'));
    modalEliminarHorario = new bootstrap.Modal(document.getElementById('modalEliminarHorario'));

    cargarMedicosSelect();
    cargarTablaHorarios();
});

// carga los médicos en el select
function cargarMedicosSelect() {
    const datos = obtenerMedicos();
    medicos = datos.medicos || [];

    const select = document.getElementById('horarioMedico');
    select.innerHTML = '<option value="">Selecciona un médico</option>';

    const filtroSelect = document.getElementById('filtroMedico');
    filtroSelect.innerHTML = '<option value="">-- Todos los médicos --</option>';

    medicos.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.id;
        option.textContent = `${medico.apellido ? medico.apellido + ', ' : ''}${medico.nombre}`;
        select.appendChild(option);

        const optionFiltro = option.cloneNode(true);
        filtroSelect.appendChild(optionFiltro);
    });
}

// carga la tabla de horarios
function cargarTablaHorarios() {
    const datos = obtenerHorarios();
    const tbody = document.getElementById('tablaHorarios');
    tbody.innerHTML = '';

    let horariosAMostrar = datos.horarios || [];

    // filtrar si hay un filtro activo
    if (filtroMedicoId) {
        horariosAMostrar = horariosAMostrar.filter(h => h.medicoId === parseInt(filtroMedicoId));
    }

    if (horariosAMostrar.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    No hay horarios registrados. <a href="#" onclick="abrirModalAgregarHorario()">Agregar el primero</a>
                </td>
            </tr>
        `;
        return;
    }

    horariosAMostrar.forEach(horario => {
        const medico = medicos.find(m => m.id === horario.medicoId);
        const nombreMedico = medico ? `${medico.apellido ? medico.apellido + ', ' : ''}${medico.nombre}` : 'N/A';

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><strong>${horario.id}</strong></td>
            <td>${nombreMedico}</td>
            <td>${horario.dia}</td>
            <td>${horario.horaInicio}</td>
            <td>${horario.horaFin}</td>
            <td>${horario.duracionTurno}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="abrirModalEditarHorario(${horario.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="abrirModalEliminarHorario(${horario.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// filtra los horarios por médico
function filtrarHorarios() {
    filtroMedicoId = document.getElementById('filtroMedico').value;
    cargarTablaHorarios();
}

// abre el modal para agregar horario
function abrirModalAgregarHorario() {
    horarioEditandoId = null;
    document.getElementById('modalTituloHorario').textContent = 'Agregar Horario';
    document.getElementById('formHorario').reset();
    document.getElementById('horarioDuracion').value = 30;
    modalHorario.show();
}

// abre el modal para editar horario
function abrirModalEditarHorario(id) {
    const datos = obtenerHorarios();
    const horario = datos.horarios.find(h => h.id === id);

    if (!horario) {
        alert('No se encontró el horario');
        return;
    }

    horarioEditandoId = id;
    document.getElementById('modalTituloHorario').textContent = 'Editar Horario';

    document.getElementById('horarioMedico').value = horario.medicoId;
    document.getElementById('horarioDia').value = horario.dia;
    document.getElementById('horarioHoraInicio').value = horario.horaInicio;
    document.getElementById('horarioHoraFin').value = horario.horaFin;
    document.getElementById('horarioDuracion').value = horario.duracionTurno;

    modalHorario.show();
}

// guarda el horario (nuevo o editado)
function guardarHorario() {
    const form = document.getElementById('formHorario');

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // obtener datos del formulario
    const nuevoHorario = {
        medicoId: parseInt(document.getElementById('horarioMedico').value),
        dia: document.getElementById('horarioDia').value,
        horaInicio: document.getElementById('horarioHoraInicio').value,
        horaFin: document.getElementById('horarioHoraFin').value,
        duracionTurno: parseInt(document.getElementById('horarioDuracion').value)
    };

    // validar que hora inicio sea menor a hora fin
    if (nuevoHorario.horaInicio >= nuevoHorario.horaFin) {
        alert('La hora de inicio debe ser menor a la hora de fin');
        return;
    }

    // mostrar loading
    const btnTexto = document.getElementById('btnGuardarHorarioTexto');
    const btnSpinner = document.getElementById('btnGuardarHorarioSpinner');
    btnTexto.textContent = 'Guardando...';
    btnSpinner.classList.remove('d-none');

    // simular delay
    setTimeout(() => {
        try {
            if (horarioEditandoId) {
                actualizarHorario(horarioEditandoId, nuevoHorario);
                mostrarNotificacion('Horario actualizado correctamente', 'success');
            } else {
                agregarHorario(nuevoHorario);
                mostrarNotificacion('Horario agregado correctamente', 'success');
            }

            cargarTablaHorarios();
            modalHorario.hide();
        } catch (error) {
            mostrarNotificacion('Error al guardar el horario', 'error');
            console.error(error);
        } finally {
            btnTexto.textContent = 'Guardar';
            btnSpinner.classList.add('d-none');
        }
    }, 500);
}

// abre modal de confirmación para eliminar
function abrirModalEliminarHorario(id) {
    horarioEditandoId = id;
    modalEliminarHorario.show();
}

// confirma y elimina el horario
function confirmarEliminarHorario() {
    try {
        eliminarHorario(horarioEditandoId);
        mostrarNotificacion('Horario eliminado correctamente', 'success');
        cargarTablaHorarios();
        modalEliminarHorario.hide();
    } catch (error) {
        mostrarNotificacion('Error al eliminar el horario', 'error');
        console.error(error);
    }
    horarioEditandoId = null;
}

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

// crea el contenedor de toasts
function crearContenedorToast() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1055';
    document.body.appendChild(container);
    return container;
}

// cierra sesión
function cerrarSesionAdmin() {
    if (confirm('¿Seguro que quieres cerrar la sesión?')) {
        cerrarSesion();
    }
}
