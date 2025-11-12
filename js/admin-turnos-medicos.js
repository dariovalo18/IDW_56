// Variables globales para el modal de edición
let turnoActualEditando = null;

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar datos de horarios y turnos
    inicializarHorarios();
    
    cargarMedicosEnFiltro();
    // Mostrar nombre del usuario
    const sesion = JSON.parse(localStorage.getItem('sesion'));
    if (sesion) {
        document.getElementById('nombreUsuario').textContent = sesion.usuario || 'Admin';
    }
    
    // Si viene desde admin-medicos.html, cargar ese médico automáticamente
    const medicoIdGuardado = sessionStorage.getItem('medicoSeleccionadoId');
    if (medicoIdGuardado) {
        document.getElementById('filtroMedicoTurnos').value = medicoIdGuardado;
        sessionStorage.removeItem('medicoSeleccionadoId');
        cargarTurnosPorMedico();
    }
});

// Cargar médicos en el selector de filtro
function cargarMedicosEnFiltro() {
    const select = document.getElementById('filtroMedicoTurnos');
    
    // Obtener médicos de localStorage o de datos iniciales
    let medicosArray = [];
    
    // Intentar obtener de la clave 'medicosData' primero
    const medicosDataStr = localStorage.getItem('medicosData');
    if (medicosDataStr) {
        const medicosObj = JSON.parse(medicosDataStr);
        medicosArray = medicosObj.medicos || medicosObj;
    }
    
    // Si no hay en medicosData, intentar con 'medicos'
    if (medicosArray.length === 0) {
        const medicosGuardados = JSON.parse(localStorage.getItem('medicos'));
        if (medicosGuardados) {
            medicosArray = medicosGuardados;
        }
    }
    
    // Si aún no hay datos, usar medicosData del objeto global
    if (medicosArray.length === 0 && medicosData && medicosData.medicos) {
        medicosArray = medicosData.medicos;
    }
    
    medicosArray.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.id;
        option.textContent = `${medico.apellido}, ${medico.nombre}`;
        select.appendChild(option);
    });
}

// Cargar turnos del médico seleccionado
function cargarTurnosPorMedico() {
    const medicoId = parseInt(document.getElementById('filtroMedicoTurnos').value);
    const fechaFiltro = document.getElementById('filtroFechaTurnos').value;
    
    if (!medicoId) {
        document.getElementById('tablaTurnosMedicos').innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">Selecciona un médico para ver sus turnos</td>
            </tr>
        `;
        return;
    }
    
    // Obtener todos los turnos
    let turnosArray = [];
    const turnosDataStr = localStorage.getItem('turnosData');
    if (turnosDataStr) {
        const turnosObj = JSON.parse(turnosDataStr);
        turnosArray = turnosObj.turnos || turnosObj;
    }
    
    if (turnosArray.length === 0) {
        const turnosGuardados = JSON.parse(localStorage.getItem('turnos'));
        if (turnosGuardados) {
            turnosArray = turnosGuardados;
        }
    }
    
    if (turnosArray.length === 0 && turnosData && turnosData.turnos) {
        turnosArray = turnosData.turnos;
    }
    
    // Filtrar turnos por médico y fecha (si se especifica)
    let turnosFiltrados = turnosArray.filter(turno => turno.medicoId === medicoId);
    
    if (fechaFiltro) {
        turnosFiltrados = turnosFiltrados.filter(turno => turno.fecha === fechaFiltro);
    }
    
    // Ordenar por fecha y hora
    turnosFiltrados.sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora}`);
        const fechaB = new Date(`${b.fecha}T${b.hora}`);
        return fechaA - fechaB;
    });
    
    const tbody = document.getElementById('tablaTurnosMedicos');
    
    if (turnosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted">No hay turnos agendados para este médico en la fecha seleccionada</td>
            </tr>
        `;
        return;
    }
    
    // Obtener médicos, pacientes, especialidades y obras sociales
    let medicosArray = [];
    
    // Intentar obtener de la clave 'medicosData' primero
    const medicosDataStr = localStorage.getItem('medicosData');
    if (medicosDataStr) {
        const medicosObj = JSON.parse(medicosDataStr);
        medicosArray = medicosObj.medicos || medicosObj;
    }
    
    // Si no hay en medicosData, intentar con 'medicos'
    if (medicosArray.length === 0) {
        const medicosGuardados = JSON.parse(localStorage.getItem('medicos'));
        if (medicosGuardados) {
            medicosArray = medicosGuardados;
        }
    }
    
    // Si aún no hay datos, usar medicosData del objeto global
    if (medicosArray.length === 0 && medicosData && medicosData.medicos) {
        medicosArray = medicosData.medicos;
    }
    
    const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    
    // Obtener especialidades
    let especialidadesArray = [];
    const especialidadesDataStr = localStorage.getItem('especialidadesData');
    if (especialidadesDataStr) {
        const espObj = JSON.parse(especialidadesDataStr);
        especialidadesArray = espObj.especialidades || espObj;
    }
    if (especialidadesArray.length === 0 && especialidadesData && especialidadesData.especialidades) {
        especialidadesArray = especialidadesData.especialidades;
    }
    
    // Obtener obras sociales
    let obrasArray = [];
    const obrasDataStr = localStorage.getItem('obrassocialesData');
    if (obrasDataStr) {
        const obrasObj = JSON.parse(obrasDataStr);
        obrasArray = obrasObj.obrasSociales || obrasObj;
    }
    if (obrasArray.length === 0 && obrassocialesData && obrassocialesData.obrasSociales) {
        obrasArray = obrassocialesData.obrasSociales;
    }
    
    tbody.innerHTML = turnosFiltrados.map(turno => {
        // Buscar nombre del paciente
        const paciente = pacientes.find(p => p.id === turno.pacienteId);
        const nombrePaciente = paciente ? `${paciente.apellido}, ${paciente.nombre}` : `Paciente ID: ${turno.pacienteId}`;
        const documentoPaciente = paciente ? paciente.documento : 'N/A';
        
        // Obtener médico actual
        const medico = medicosArray.find(m => m.id === turno.medicoId);
        
        // Obtener especialidad
        const especialidad = medico ? especialidadesArray.find(e => e.id === medico.especialidadId) : null;
        const nombreEspecialidad = especialidad ? especialidad.nombre : 'N/A';
        
        // Obtener obra social (si existe en el turno)
        let obraSocialNombre = 'N/A';
        let porcentajeCobertura = 0;
        
        // Usar el nombre de obra social del turno si está disponible
        if (turno.obraSocialNombre) {
            obraSocialNombre = turno.obraSocialNombre;
            // Buscar el porcentaje en el array si existe
            if (turno.obraSocialId) {
                const obra = obrasArray.find(o => o.id === turno.obraSocialId);
                if (obra) {
                    porcentajeCobertura = obra.porcentaje || 0;
                }
            }
        } else if (turno.obraSocialId) {
            // Fallback: buscar por ID si no hay nombre
            const obra = obrasArray.find(o => o.id === turno.obraSocialId);
            if (obra) {
                obraSocialNombre = obra.nombre;
                porcentajeCobertura = obra.porcentaje || 0;
            }
        }
        
        // Calcular valor total
        const valorConsulta = medico ? medico.valorConsulta : 0;
        const valorCobertura = (valorConsulta * porcentajeCobertura) / 100;
        const valorTotal = valorConsulta - valorCobertura;
        
        // Determinar clase de estado
        let clasEstado = '';
        let textoEstado = '';
        if (turno.estado === 'confirmado') {
            clasEstado = 'badge bg-success';
            textoEstado = 'Confirmado';
        } else if (turno.estado === 'cancelado') {
            clasEstado = 'badge bg-danger';
            textoEstado = 'Cancelado';
        } else if (turno.estado === 'completado') {
            clasEstado = 'badge bg-info';
            textoEstado = 'Completado';
        } else {
            clasEstado = 'badge bg-secondary';
            textoEstado = turno.estado || 'Sin estado';
        }
        
        // Formatear fecha
        const fecha = new Date(`${turno.fecha}T00:00:00`);
        const fechaFormato = fecha.toLocaleDateString('es-ES', { 
            weekday: 'short', 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
        
        return `
            <tr>
                <td><strong>#${turno.id}</strong></td>
                <td>${nombrePaciente}</td>
                <td>${documentoPaciente}</td>
                <td>${fechaFormato}</td>
                <td>${turno.hora}</td>
                <td>${nombreEspecialidad}</td>
                <td>${obraSocialNombre}</td>
                <td><span class="${clasEstado}">${textoEstado}</span></td>
                <td>$${valorTotal.toFixed(2)}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-info" onclick="abrirDetallesTurno(${turno.id})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-primary" onclick="abrirEditarTurno(${turno.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger" onclick="abrirEliminarTurno(${turno.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Abrir modal para ver detalles del turno
function abrirDetallesTurno(turnoId) {
    let turnosArray = [];
    const turnosDataStr = localStorage.getItem('turnosData');
    if (turnosDataStr) {
        const turnosObj = JSON.parse(turnosDataStr);
        turnosArray = turnosObj.turnos || turnosObj;
    }
    
    if (turnosArray.length === 0) {
        const turnosGuardados = JSON.parse(localStorage.getItem('turnos'));
        if (turnosGuardados) {
            turnosArray = turnosGuardados;
        }
    }
    
    if (turnosArray.length === 0 && turnosData && turnosData.turnos) {
        turnosArray = turnosData.turnos;
    }
    
    const turno = turnosArray.find(t => t.id === turnoId);
    
    if (!turno) {
        alert('Turno no encontrado');
        return;
    }
    
    // Obtener datos del paciente
    const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    const paciente = pacientes.find(p => p.id === turno.pacienteId);
    
    // Obtener médicos
    let medicosArray = [];
    const medicosDataStr = localStorage.getItem('medicosData');
    if (medicosDataStr) {
        const medicosObj = JSON.parse(medicosDataStr);
        medicosArray = medicosObj.medicos || medicosObj;
    }
    if (medicosArray.length === 0) {
        const medicosGuardados = JSON.parse(localStorage.getItem('medicos'));
        if (medicosGuardados) {
            medicosArray = medicosGuardados;
        }
    }
    if (medicosArray.length === 0 && medicosData && medicosData.medicos) {
        medicosArray = medicosData.medicos;
    }
    
    const medico = medicosArray.find(m => m.id === turno.medicoId);
    
    // Obtener especialidades
    let especialidadesArray = [];
    const especialidadesDataStr = localStorage.getItem('especialidadesData');
    if (especialidadesDataStr) {
        const espObj = JSON.parse(especialidadesDataStr);
        especialidadesArray = espObj.especialidades || espObj;
    }
    if (especialidadesArray.length === 0 && especialidadesData && especialidadesData.especialidades) {
        especialidadesArray = especialidadesData.especialidades;
    }
    
    const especialidad = medico ? especialidadesArray.find(e => e.id === medico.especialidadId) : null;
    
    // Obtener obras sociales
    let obrasArray = [];
    const obrasDataStr = localStorage.getItem('obrassocialesData');
    if (obrasDataStr) {
        const obrasObj = JSON.parse(obrasDataStr);
        obrasArray = obrasObj.obrasSociales || obrasObj;
    }
    if (obrasArray.length === 0 && obrassocialesData && obrassocialesData.obrasSociales) {
        obrasArray = obrassocialesData.obrasSociales;
    }
    
    let obraSocial = null;
    if (turno.obraSocialId) {
        obraSocial = obrasArray.find(o => o.id === turno.obraSocialId);
    }
    
    // Calcular valores
    const valorConsulta = medico ? medico.valorConsulta : 0;
    const porcentajeCobertura = obraSocial ? obraSocial.porcentaje : 0;
    const valorCobertura = (valorConsulta * porcentajeCobertura) / 100;
    const valorTotal = valorConsulta - valorCobertura;
    
    // Determinar clase de estado
    let clasEstado = '';
    if (turno.estado === 'confirmado') {
        clasEstado = 'bg-success';
    } else if (turno.estado === 'cancelado') {
        clasEstado = 'bg-danger';
    } else if (turno.estado === 'completado') {
        clasEstado = 'bg-info';
    } else {
        clasEstado = 'bg-secondary';
    }
    
    // Llenar modal de detalles
    document.getElementById('detallesIdTurno').textContent = turno.id;
    document.getElementById('detallesIdPaciente').textContent = turno.pacienteId;
    document.getElementById('detallesNombrePaciente').textContent = paciente ? `${paciente.apellido}, ${paciente.nombre}` : 'N/A';
    document.getElementById('detallesDocumento').textContent = paciente ? paciente.documento : 'N/A';
    document.getElementById('detallesNumeroTurno').textContent = turno.id;
    
    const fecha = new Date(`${turno.fecha}T00:00:00`);
    const fechaFormato = fecha.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('detallesFecha').textContent = fechaFormato;
    document.getElementById('detallesHora').textContent = turno.hora;
    
    document.getElementById('detallesMedico').textContent = medico ? `${medico.apellido}, ${medico.nombre}` : 'N/A';
    document.getElementById('detallesEspecialidad').textContent = especialidad ? especialidad.nombre : 'N/A';
    
    // Usar el nombre de obra social del turno si está disponible, sino buscar en el array
    const nombreObraSocial = turno.obraSocialNombre || (obraSocial ? obraSocial.nombre : 'Sin obra social');
    document.getElementById('detallesObraSocial').textContent = nombreObraSocial;
    document.getElementById('detallesPorcentajeCobertura').textContent = `${porcentajeCobertura}%`;
    
    document.getElementById('detallesValorConsulta').textContent = valorConsulta.toFixed(2);
    document.getElementById('detallesValorCobertura').textContent = valorCobertura.toFixed(2);
    document.getElementById('detallesValorTotal').textContent = valorTotal.toFixed(2);
    
    const estadoBadge = document.getElementById('detallesEstado');
    estadoBadge.textContent = turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1);
    estadoBadge.className = `badge ${clasEstado}`;
    
    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById('modalDetallesTurno'));
    modal.show();
}

// Abrir modal para editar turno
function abrirEditarTurno(turnoId) {
    let turnosArray = [];
    const turnosDataStr = localStorage.getItem('turnosData');
    if (turnosDataStr) {
        const turnosObj = JSON.parse(turnosDataStr);
        turnosArray = turnosObj.turnos || turnosObj;
    }
    
    if (turnosArray.length === 0) {
        const turnosGuardados = JSON.parse(localStorage.getItem('turnos'));
        if (turnosGuardados) {
            turnosArray = turnosGuardados;
        }
    }
    
    if (turnosArray.length === 0 && turnosData && turnosData.turnos) {
        turnosArray = turnosData.turnos;
    }
    
    const turno = turnosArray.find(t => t.id === turnoId);
    
    if (!turno) {
        alert('Turno no encontrado');
        return;
    }
    
    // Obtener datos del paciente
    const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
    const paciente = pacientes.find(p => p.id === turno.pacienteId);
    
    turnoActualEditando = turnoId;
    
    // Llenar el formulario
    document.getElementById('turnoFecha').value = turno.fecha;
    document.getElementById('turnoHora').value = turno.hora;
    document.getElementById('turnoEstado').value = turno.estado;
    document.getElementById('turnoPacienteNombre').value = paciente ? 
        `${paciente.apellido}, ${paciente.nombre}` : 
        `Paciente ID: ${turno.pacienteId}`;
    
    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById('modalEditarTurno'));
    modal.show();
}

// Guardar turno editado
function guardarTurnoEditado() {
    let turnosArray = [];
    const turnosDataStr = localStorage.getItem('turnosData');
    if (turnosDataStr) {
        const turnosObj = JSON.parse(turnosDataStr);
        turnosArray = turnosObj.turnos || turnosObj;
    }
    
    if (turnosArray.length === 0) {
        const turnosGuardados = JSON.parse(localStorage.getItem('turnos'));
        if (turnosGuardados) {
            turnosArray = turnosGuardados;
        }
    }
    
    if (turnosArray.length === 0 && turnosData && turnosData.turnos) {
        turnosArray = turnosData.turnos;
    }
    
    const turnoIndex = turnosArray.findIndex(t => t.id === turnoActualEditando);
    
    if (turnoIndex === -1) {
        alert('Turno no encontrado');
        return;
    }
    
    const nuevaFecha = document.getElementById('turnoFecha').value;
    const nuevaHora = document.getElementById('turnoHora').value;
    const nuevoEstado = document.getElementById('turnoEstado').value;
    
    // Validar que la nueva fecha/hora no conflictue con otro turno del mismo médico
    const medicoId = turnosArray[turnoIndex].medicoId;
    const conflicto = turnosArray.some(t => 
        t.id !== turnoActualEditando && 
        t.medicoId === medicoId && 
        t.fecha === nuevaFecha && 
        t.hora === nuevaHora
    );
    
    if (conflicto) {
        alert('❌ No puedes agendar dos turnos al mismo médico a la misma hora');
        return;
    }
    
    // Actualizar turno
    turnosArray[turnoIndex].fecha = nuevaFecha;
    turnosArray[turnoIndex].hora = nuevaHora;
    turnosArray[turnoIndex].estado = nuevoEstado;
    
    // Guardar en turnosData con la estructura correcta
    localStorage.setItem('turnosData', JSON.stringify({ turnos: turnosArray }));
    
    // Cerrar modal y recargar tabla
    bootstrap.Modal.getInstance(document.getElementById('modalEditarTurno')).hide();
    cargarTurnosPorMedico();
    
    alert('✅ Turno actualizado exitosamente');
}

// Abrir modal para eliminar turno
function abrirEliminarTurno(turnoId) {
    turnoActualEditando = turnoId;
    const modal = new bootstrap.Modal(document.getElementById('modalEliminarTurno'));
    modal.show();
}

// Confirmar eliminación de turno
function confirmarEliminarTurno() {
    let turnosArray = [];
    const turnosDataStr = localStorage.getItem('turnosData');
    if (turnosDataStr) {
        const turnosObj = JSON.parse(turnosDataStr);
        turnosArray = turnosObj.turnos || turnosObj;
    }
    
    if (turnosArray.length === 0) {
        const turnosGuardados = JSON.parse(localStorage.getItem('turnos'));
        if (turnosGuardados) {
            turnosArray = turnosGuardados;
        }
    }
    
    if (turnosArray.length === 0 && turnosData && turnosData.turnos) {
        turnosArray = [...turnosData.turnos]; // Copiar array
    }
    
    const turnosActualizados = turnosArray.filter(t => t.id !== turnoActualEditando);
    
    // Guardar en turnosData con la estructura correcta
    localStorage.setItem('turnosData', JSON.stringify({ turnos: turnosActualizados }));
    
    // Cerrar modal y recargar tabla
    bootstrap.Modal.getInstance(document.getElementById('modalEliminarTurno')).hide();
    cargarTurnosPorMedico();
    
    alert('✅ Turno eliminado exitosamente');
}


// Cerrar sesión del admin
function cerrarSesionAdmin() {
    if (confirm('¿Deseas cerrar sesión?')) {
        cerrarSesion();
    }
}
