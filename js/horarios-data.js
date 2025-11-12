// Funciones para gestionar horarios de médicos

// inicializa los horarios en localStorage si no existen
function inicializarHorarios() {
    const horariosGuardados = localStorage.getItem('horariosData');
    const turnosGuardados = localStorage.getItem('turnosData');

    if (!horariosGuardados || horariosGuardados === '{"horarios":[]}') {
        localStorage.setItem('horariosData', JSON.stringify(horariosData));
        console.log('Horarios cargados por defecto');
    }

    if (!turnosGuardados || turnosGuardados === '{"turnos":[]}') {
        localStorage.setItem('turnosData', JSON.stringify(turnosData));
        console.log('Turnos cargados por defecto');
    }

    // migrar datos antiguos si es necesario
    migrarHorarios();
    migrarTurnos();
}

// obtiene los horarios guardados
function obtenerHorarios() {
    const horariosGuardados = localStorage.getItem('horariosData');
    return horariosGuardados ? JSON.parse(horariosGuardados) : horariosData;
}

// obtiene los turnos guardados
function obtenerTurnos() {
    const turnosGuardados = localStorage.getItem('turnosData');
    return turnosGuardados ? JSON.parse(turnosGuardados) : turnosData;
}

// guarda los horarios en localStorage
function guardarHorarios(datos) {
    localStorage.setItem('horariosData', JSON.stringify(datos));
}

// guarda los turnos en localStorage
function guardarTurnos(datos) {
    localStorage.setItem('turnosData', JSON.stringify(datos));
}

// agrega un nuevo horario
function agregarHorario(nuevoHorario) {
    const datos = obtenerHorarios();
    const maxId = datos.horarios.length > 0 ? Math.max(...datos.horarios.map(h => h.id)) : 0;
    nuevoHorario.id = maxId + 1;
    datos.horarios.push(nuevoHorario);
    guardarHorarios(datos);
    return nuevoHorario.id;
}

// actualiza un horario existente
function actualizarHorario(id, datosActualizados) {
    const datos = obtenerHorarios();
    const index = datos.horarios.findIndex(h => h.id === id);
    if (index !== -1) {
        datos.horarios[index] = { ...datos.horarios[index], ...datosActualizados };
        guardarHorarios(datos);
        return true;
    }
    return false;
}

// elimina un horario
function eliminarHorario(id) {
    const datos = obtenerHorarios();
    datos.horarios = datos.horarios.filter(h => h.id !== id);
    guardarHorarios(datos);
}

// obtiene horarios de un médico específico
function obtenerHorariosPorMedico(medicoId) {
    const datos = obtenerHorarios();
    return datos.horarios.filter(h => h.medicoId === medicoId);
}

// agrega un nuevo turno
function agregarTurno(nuevoTurno) {
    const datos = obtenerTurnos();
    const maxId = datos.turnos.length > 0 ? Math.max(...datos.turnos.map(t => t.id)) : 0;
    nuevoTurno.id = maxId + 1;
    // Solo asignar si no vienen en el objeto
    if (!nuevoTurno.fechaAgendado) {
        nuevoTurno.fechaAgendado = new Date().toISOString();
    }
    if (!nuevoTurno.estado) {
        nuevoTurno.estado = 'confirmado';
    }
    datos.turnos.push(nuevoTurno);
    guardarTurnos(datos);
    return nuevoTurno.id;
}

// obtiene turnos de un paciente
function obtenerTurnosPorPaciente(pacienteId) {
    const datos = obtenerTurnos();
    return datos.turnos.filter(t => t.pacienteId === pacienteId);
}

// obtiene turnos de un médico
function obtenerTurnosPorMedico(medicoId) {
    const datos = obtenerTurnos();
    return datos.turnos.filter(t => t.medicoId === medicoId);
}

// obtiene turnos de una fecha específica
function obtenerTurnosPorFecha(medicoId, fecha) {
    const datos = obtenerTurnos();
    return datos.turnos.filter(t => t.medicoId === medicoId && t.fecha === fecha);
}

// elimina un turno
function eliminarTurno(id) {
    const datos = obtenerTurnos();
    datos.turnos = datos.turnos.filter(t => t.id !== id);
    guardarTurnos(datos);
}

// verifica si un turno está disponible
function verificarDisponibilidad(medicoId, fecha, hora, duracion) {
    const turnosProgramados = obtenerTurnosPorFecha(medicoId, fecha);
    
    const horaInicio = new Date(`2000-01-01 ${hora}`).getTime();
    const horaFin = horaInicio + (duracion * 60 * 1000);

    return !turnosProgramados.some(turno => {
        const turnoHoraInicio = new Date(`2000-01-01 ${turno.hora}`).getTime();
        const turnoHoraFin = turnoHoraInicio + (30 * 60 * 1000); // asumiendo 30 min por defecto
        
        return (horaInicio < turnoHoraFin) && (horaFin > turnoHoraInicio);
    });
}

// migra horarios antiguos si es necesario
function migrarHorarios() {
    const datos = obtenerHorarios();
    let necesitaMigracion = false;

    datos.horarios = datos.horarios.map(horario => {
        if (!horario.duracionTurno) {
            necesitaMigracion = true;
            return {
                ...horario,
                duracionTurno: 30
            };
        }
        return horario;
    });

    if (necesitaMigracion) {
        guardarHorarios(datos);
        console.log('Horarios migrados al nuevo formato');
    }
}

// migra turnos antiguos si es necesario
function migrarTurnos() {
    const datos = obtenerTurnos();
    let necesitaMigracion = false;

    datos.turnos = datos.turnos.map(turno => {
        if (!turno.estado) {
            necesitaMigracion = true;
            turno.estado = 'confirmado';
        }
        if (!turno.fechaAgendado) {
            necesitaMigracion = true;
            turno.fechaAgendado = new Date().toISOString();
        }
        return turno;
    });

    if (necesitaMigracion) {
        guardarTurnos(datos);
        console.log('Turnos migrados al nuevo formato');
    }
}
