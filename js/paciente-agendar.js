// variables globales para agendamiento
let modalAgendarTurno = null;
let medicoSeleccionadoId = null;
let horaSeleccionada = null;
let medicosCargados = [];
let especialidadesCargadas = [];
let obrasSocialesCargadas = [];
let horariosCargados = [];

// inicializar
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar datos de horarios y turnos
    inicializarHorarios();
    
    modalAgendarTurno = new bootstrap.Modal(document.getElementById('modalAgendarTurno'));

    // Mostrar nombre del usuario
    const sesion = JSON.parse(localStorage.getItem('sesion') || '{}');
    if (sesion.firstName && sesion.lastName) {
        document.getElementById('nombreUsuario').textContent = `${sesion.firstName} ${sesion.lastName}`;
    }
    
    // Mostrar obra social seleccionada
    if (sesion.obraSocialNombre) {
        document.getElementById('obraSocialDisplay').textContent = sesion.obraSocialNombre;
    }

    cargarDatos();
    cargarFiltros();
});

// carga todos los datos necesarios
function cargarDatos() {
    const datosMedicos = obtenerMedicos();
    const datosEspecialidades = JSON.parse(localStorage.getItem('especialidadesData') || JSON.stringify(especialidadesData));
    const datosObrasSociales = JSON.parse(localStorage.getItem('obrassocialesData') || JSON.stringify(obrassocialesData));
    const datosHorarios = obtenerHorarios();

    medicosCargados = datosMedicos.medicos || [];
    especialidadesCargadas = datosEspecialidades.especialidades || [];
    obrasSocialesCargadas = datosObrasSociales.obrasSociales || [];
    horariosCargados = datosHorarios.horarios || [];
}

// carga los filtros
function cargarFiltros() {
    // cargar especialidades
    const selectEspecialidad = document.getElementById('filtroEspecialidad');
    selectEspecialidad.innerHTML = '<option value="">-- Todas --</option>';
    especialidadesCargadas.forEach(esp => {
        const option = document.createElement('option');
        option.value = esp.id;
        option.textContent = esp.nombre;
        selectEspecialidad.appendChild(option);
    });

    // cargar obras sociales
    const selectObraSocial = document.getElementById('filtroObraSocial');
    selectObraSocial.innerHTML = '<option value="">-- Todas --</option>';
    obrasSocialesCargadas.forEach(obra => {
        const option = document.createElement('option');
        option.value = obra.id;
        option.textContent = obra.nombre;
        selectObraSocial.appendChild(option);
    });

    // cargar médicos (todos inicialmente)
    cargarMedicosSelect();
}

// carga médicos en el select
function cargarMedicosSelect() {
    const selectMedico = document.getElementById('filtroMedico');
    selectMedico.innerHTML = '<option value="">-- Todos --</option>';
    medicosCargados.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.id;
        option.textContent = `${medico.apellido ? medico.apellido + ', ' : ''}${medico.nombre}`;
        selectMedico.appendChild(option);
    });
}

// filtra y muestra médicos según los criterios
function filtrarMedicos() {
    const especialidadId = document.getElementById('filtroEspecialidad').value;
    const obraSocialId = document.getElementById('filtroObraSocial').value;
    const medicoId = document.getElementById('filtroMedico').value;

    // filtrar médicos
    let medicosFiltrados = medicosCargados;

    if (especialidadId) {
        medicosFiltrados = medicosFiltrados.filter(m => m.especialidadId === parseInt(especialidadId));
    }

    if (obraSocialId) {
        medicosFiltrados = medicosFiltrados.filter(m => m.obrasocialesId.includes(parseInt(obraSocialId)));
    }

    if (medicoId) {
        medicosFiltrados = medicosFiltrados.filter(m => m.id === parseInt(medicoId));
    }

    mostrarMedicosDisponibles(medicosFiltrados);
}

// muestra los médicos disponibles en tarjetas
function mostrarMedicosDisponibles(medicos) {
    const container = document.getElementById('medicosDisponibles');

    if (medicos.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">No se encontraron médicos con esos criterios</div>';
        return;
    }

    container.innerHTML = '';

    medicos.forEach(medico => {
        const especialidad = especialidadesCargadas.find(e => e.id === medico.especialidadId);
        const nombreEspecialidad = especialidad ? especialidad.nombre : 'N/A';

        // obtener horarios del médico
        const horariosDelMedico = horariosCargados.filter(h => h.medicoId === medico.id);

        const tarjeta = document.createElement('div');
        tarjeta.className = 'col-md-6 col-lg-4 mb-3';
        tarjeta.innerHTML = `
            <div class="card h-100">
                <img src="${medico.imagen}" class="card-img-top" alt="${medico.alt}" 
                     style="height: 200px; object-fit: cover;"
                     onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=default';">
                <div class="card-body">
                    <h5 class="card-title">${medico.apellido ? medico.apellido + ', ' : ''}${medico.nombre}</h5>
                    <p class="card-text">
                        <small class="text-muted">
                            <strong>Especialidad:</strong> ${nombreEspecialidad}<br>
                            <strong>Matrícula:</strong> ${medico.matricula}<br>
                            <strong>Valor Consulta:</strong> $${medico.valorConsulta.toFixed(2)}<br>
                            <strong>Horarios:</strong> ${horariosDelMedico.length > 0 ? horariosDelMedico.map(h => h.dia.substring(0, 3)).join(', ') : 'Sin horarios'}
                        </small>
                    </p>
                    <p class="card-text">${medico.descripcion}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary w-100" onclick="abrirModalAgendarTurno(${medico.id})">Agendar Turno</button>
                </div>
            </div>
        `;
        container.appendChild(tarjeta);
    });
}

// abre modal para agendar turno
function abrirModalAgendarTurno(medicoId) {
    medicoSeleccionadoId = medicoId;
    horaSeleccionada = null;

    const medico = medicosCargados.find(m => m.id === medicoId);
    const especialidad = especialidadesCargadas.find(e => e.id === medico.especialidadId);

    document.getElementById('tituloModalTurno').textContent = `Agendar Turno con ${medico.nombre}`;
    document.getElementById('datosMedicoTurno').innerHTML = `
        <strong>${medico.apellido ? medico.apellido + ', ' : ''}${medico.nombre}</strong> - 
        ${especialidad ? especialidad.nombre : 'N/A'} - 
        $${medico.valorConsulta.toFixed(2)}
    `;

    document.getElementById('fechaTurno').value = '';
    document.getElementById('horariosDisponibles').innerHTML = '<div class="col-12 text-muted">Selecciona una fecha para ver los horarios disponibles</div>';
    document.getElementById('btnConfirmarTurno').disabled = true;

    modalAgendarTurno.show();
}

// carga horarios disponibles para una fecha
function cargarHorariosDisponibles() {
    const fecha = document.getElementById('fechaTurno').value;

    if (!fecha) {
        document.getElementById('horariosDisponibles').innerHTML = '<div class="col-12 text-muted">Selecciona una fecha para ver los horarios disponibles</div>';
        return;
    }

    // obtener horarios del médico
    const horariosDelMedico = horariosCargados.filter(h => h.medicoId === medicoSeleccionadoId);

    // obtener el día de la semana de la fecha
    const fechaObj = new Date(fecha + 'T00:00:00');
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaSeleccionado = dias[fechaObj.getDay()];

    // filtrar horarios del día
    const horariosDelDia = horariosDelMedico.filter(h => h.dia === diaSeleccionado);

    if (horariosDelDia.length === 0) {
        document.getElementById('horariosDisponibles').innerHTML = `<div class="col-12 text-muted">El médico no atiende los ${diaSeleccionado}s</div>`;
        return;
    }

    // generar horas disponibles
    const container = document.getElementById('horariosDisponibles');
    container.innerHTML = '';

    horariosDelDia.forEach(horario => {
        // generar slots de tiempo
        const inicio = new Date(`2000-01-01 ${horario.horaInicio}`);
        const fin = new Date(`2000-01-01 ${horario.horaFin}`);

        let horaActual = new Date(inicio);

        while (horaActual < fin) {
            const horaFormato = horaActual.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

            // verificar disponibilidad
            const disponible = verificarDisponibilidad(medicoSeleccionadoId, fecha, horaFormato, horario.duracionTurno);

            const button = document.createElement('button');
            button.className = `btn btn-sm ${disponible ? 'btn-outline-success' : 'btn-outline-danger disabled'}`;
            button.textContent = horaFormato;
            button.onclick = () => seleccionarHora(horaFormato);
            button.disabled = !disponible;

            const div = document.createElement('div');
            div.className = 'col-auto';
            div.appendChild(button);
            container.appendChild(div);

            horaActual.setMinutes(horaActual.getMinutes() + horario.duracionTurno);
        }
    });
}

// selecciona una hora
function seleccionarHora(hora) {
    horaSeleccionada = hora;
    document.getElementById('btnConfirmarTurno').disabled = false;

    // destacar botón seleccionado
    document.querySelectorAll('#horariosDisponibles button').forEach(btn => {
        btn.classList.remove('btn-success');
        btn.classList.add('btn-outline-success');
        if (btn.textContent === hora) {
            btn.classList.remove('btn-outline-success');
            btn.classList.add('btn-success');
        }
    });
}

// confirma y agenda el turno
function confirmarAgendarTurno() {
    const fecha = document.getElementById('fechaTurno').value;

    if (!fecha || !horaSeleccionada) {
        alert('Selecciona fecha y hora');
        return;
    }

    // mostrar loading
    const btnTexto = document.getElementById('btnConfirmarTexto');
    const btnSpinner = document.getElementById('btnConfirmarSpinner');
    btnTexto.textContent = 'Agendando...';
    btnSpinner.classList.remove('d-none');

    // simular delay
    setTimeout(() => {
        try {
            const sesion = JSON.parse(localStorage.getItem('sesion') || '{}');

            const nuevoTurno = {
                pacienteId: sesion.id,
                pacienteNombre: `${sesion.firstName} ${sesion.lastName}`,
                pacienteDocumento: sesion.documento || 'N/A',
                medicoId: medicoSeleccionadoId,
                fecha: fecha,
                hora: horaSeleccionada,
                obraSocialId: sesion.obraSocialId || null,
                obraSocialNombre: sesion.obraSocialNombre || 'Sin obra social',
                obraSocialPorcentaje: sesion.obraSocialPorcentaje || 0,
                estado: 'confirmado',
                fechaAgendado: new Date().toISOString()
            };

            agregarTurno(nuevoTurno);

            mostrarNotificacion('✅ Turno agendado correctamente', 'success');
            modalAgendarTurno.hide();

            // limpiar
            document.getElementById('fechaTurno').value = '';
            horaSeleccionada = null;

        } catch (error) {
            mostrarNotificacion('❌ Error al agendar el turno', 'error');
            console.error(error);
        } finally {
            btnTexto.textContent = 'Confirmar Turno';
            btnSpinner.classList.add('d-none');
        }
    }, 800);
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

// Función para cambiar obra social
function cambiarObraSocial() {
    window.location.href = 'seleccionar-obra-social.html?cambiar=true';
}
