// variables globales para paciente
let turnoParaCancelarId = null;
let modalCancelarTurno = null;
let medicosCargados = [];
let especialidadesCargadas = [];

// inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    modalCancelarTurno = new bootstrap.Modal(document.getElementById('modalCancelarTurno'));

    // obtener ID del paciente desde la sesión
    const sesion = JSON.parse(localStorage.getItem('sesion') || '{}');
    const pacienteId = sesion.id;

    // Mostrar nombre del usuario
    if (sesion.firstName && sesion.lastName) {
        document.getElementById('nombreUsuario').textContent = `${sesion.firstName} ${sesion.lastName}`;
    }

    if (!pacienteId) {
        alert('No se pudo obtener el ID del paciente');
        return;
    }

    cargarMedicosYEspecialidades();
    cargarTurnosPaciente(pacienteId);
});

// carga médicos y especialidades
function cargarMedicosYEspecialidades() {
    const datosMedicos = obtenerMedicos();
    const datosEspecialidades = JSON.parse(localStorage.getItem('especialidadesData') || JSON.stringify(especialidadesData));

    medicosCargados = datosMedicos.medicos || [];
    especialidadesCargadas = datosEspecialidades.especialidades || [];
}

// carga y muestra los turnos del paciente
function cargarTurnosPaciente(pacienteId) {
    const datos = obtenerTurnos();
    const turnos = datos.turnos.filter(t => t.pacienteId === pacienteId) || [];
    const tbody = document.getElementById('tablaTurnos');

    tbody.innerHTML = '';

    if (turnos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    No tienes turnos agendados. <a href="paciente-agendar.html">Agendar uno aquí</a>
                </td>
            </tr>
        `;
        return;
    }

    turnos.forEach(turno => {
        const medico = medicosCargados.find(m => m.id === turno.medicoId);
        const especialidad = especialidadesCargadas.find(e => e.id === medico?.especialidadId);

        const nombreMedico = medico ? `${medico.apellido ? medico.apellido + ', ' : ''}${medico.nombre}` : 'N/A';
        const nombreEspecialidad = especialidad ? especialidad.nombre : 'N/A';

        // formatear fecha correctamente (turno.fecha está en formato YYYY-MM-DD)
        const fechaParts = turno.fecha.split('-');
        const fecha = new Date(parseInt(fechaParts[0]), parseInt(fechaParts[1]) - 1, parseInt(fechaParts[2]));
        const fechaFormato = fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // color del estado
        const badgeClass = turno.estado === 'confirmado' ? 'bg-success' : 'bg-warning';

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><strong>${turno.id}</strong></td>
            <td>${nombreMedico}</td>
            <td>${nombreEspecialidad}</td>
            <td>${fechaFormato}</td>
            <td><strong>${turno.hora}</strong></td>
            <td><span class="badge ${badgeClass}">${turno.estado}</span></td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="abrirModalCancelarTurno(${turno.id})">Cancelar</button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// abre modal para cancelar turno
function abrirModalCancelarTurno(turnoId) {
    turnoParaCancelarId = turnoId;
    modalCancelarTurno.show();
}

// confirma y cancela el turno
function confirmarCancelarTurno() {
    try {
        eliminarTurno(turnoParaCancelarId);
        mostrarNotificacion('Turno cancelado correctamente', 'success');

        const sesion = JSON.parse(localStorage.getItem('sesion') || '{}');
        cargarTurnosPaciente(sesion.id);

        modalCancelarTurno.hide();
    } catch (error) {
        mostrarNotificacion('Error al cancelar el turno', 'error');
        console.error(error);
    }
    turnoParaCancelarId = null;
}

// muestra notificaciones
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

// crea contenedor de toasts
function crearContenedorToast() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1055';
    document.body.appendChild(container);
    return container;
}
