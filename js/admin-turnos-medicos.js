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

// ====== NUEVO TURNO (ADMIN) ======
let modalNuevoTurnoInstancia = null;
let cachePacientesAdmin = [];

function abrirModalNuevoTurno() {
    // crear instancia modal si no existe
    if (!modalNuevoTurnoInstancia) {
        modalNuevoTurnoInstancia = new bootstrap.Modal(document.getElementById('modalNuevoTurno'));
    }

    // reset de formulario
    document.getElementById('formNuevoTurno').reset();
    deshabilitar('#nuevoMedico', true, 'Selecciona especialidad');
    deshabilitar('#nuevoFecha', true);
    deshabilitar('#nuevoHora', true, 'Selecciona fecha');
    deshabilitar('#nuevoObraSocial', true, 'Selecciona paciente');
    document.getElementById('btnGuardarNuevoTurno').disabled = true;
    document.getElementById('resumenMedico').textContent = '-';
    document.getElementById('resumenValor').textContent = '0.00';
    document.getElementById('resumenCobertura').textContent = '0';
    document.getElementById('resumenTotal').textContent = '0.00';
    document.getElementById('alertaEstadoDatos').style.display = 'block';
    document.getElementById('alertaConflicto').style.display = 'none';

    cargarEspecialidadesNuevo();
    cargarPacientesNuevo();
    cargarObrasSocialesNuevo();

    modalNuevoTurnoInstancia.show();
}

function deshabilitar(selector, disabled, placeholderText) {
    const el = document.querySelector(selector);
    el.disabled = !!disabled;
    if (placeholderText !== undefined) {
        el.innerHTML = `<option value="">${placeholderText}</option>`;
    }
}

function cargarEspecialidadesNuevo() {
    const sel = document.getElementById('nuevoEspecialidad');
    sel.innerHTML = '<option value="">Selecciona...</option>';
    let especialidadesArray = [];
    const especialidadesDataStr = localStorage.getItem('especialidadesData');
    if (especialidadesDataStr) {
        const espObj = JSON.parse(especialidadesDataStr);
        especialidadesArray = espObj.especialidades || espObj;
    }
    if (especialidadesArray.length === 0 && typeof especialidadesData !== 'undefined' && especialidadesData.especialidades) {
        especialidadesArray = especialidadesData.especialidades;
    }
    especialidadesArray.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = e.nombre;
        sel.appendChild(opt);
    });
}

function obtenerMedicosArray() {
    let medicosArray = [];
    const medicosDataStr = localStorage.getItem('medicosData');
    if (medicosDataStr) {
        const medicosObj = JSON.parse(medicosDataStr);
        medicosArray = medicosObj.medicos || medicosObj;
    }
    if (medicosArray.length === 0) {
        const medicosGuardados = JSON.parse(localStorage.getItem('medicos'));
        if (medicosGuardados) medicosArray = medicosGuardados;
    }
    if (medicosArray.length === 0 && typeof medicosData !== 'undefined' && medicosData.medicos) {
        medicosArray = medicosData.medicos;
    }
    return medicosArray;
}

function renderMedicosModal(lista) {
    const selMedico = document.getElementById('nuevoMedico');
    const valorActual = selMedico.value;
    selMedico.innerHTML = '<option value="">Selecciona médico</option>';
    lista.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = `${m.apellido}, ${m.nombre}`;
        opt.dataset.valor = m.valorConsulta;
        selMedico.appendChild(opt);
    });
    if ([...selMedico.options].some(o => o.value === valorActual)) {
        selMedico.value = valorActual;
    }
}

function prepararBusquedaMedicoModal() {
    const input = document.getElementById('buscarMedicoNuevo');
    const selMedico = document.getElementById('nuevoMedico');
    if (input && !input.dataset.listener) {
        input.addEventListener('input', () => {
            const termino = (input.value || '').toLowerCase();
            const lista = JSON.parse(selMedico.dataset.medicosModal || '[]');
            if (!termino) {
                renderMedicosModal(lista);
                return;
            }
            const filtrados = lista.filter(m =>
                `${m.apellido} ${m.nombre}`.toLowerCase().includes(termino) ||
                `${m.nombre} ${m.apellido}`.toLowerCase().includes(termino)
            );
            renderMedicosModal(filtrados);
        });
        input.dataset.listener = 'true';
    }
}

function prepararBusquedaPacienteModal() {
    const input = document.getElementById('buscarPacienteNuevo');
    const sel = document.getElementById('nuevoPaciente');
    if (input && !input.dataset.listener) {
        input.addEventListener('input', () => {
            const termino = (input.value || '').toLowerCase();
            sel.innerHTML = '<option value="">Selecciona paciente</option>';
            const lista = cachePacientesAdmin || [];
            const filtrados = !termino ? lista : lista.filter(u =>
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(termino) ||
                `${u.lastName} ${u.firstName}`.toLowerCase().includes(termino)
            );
            filtrados.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = `${u.firstName} ${u.lastName}`;
                opt.dataset.firstName = u.firstName;
                opt.dataset.lastName = u.lastName;
                sel.appendChild(opt);
            });
        });
        input.dataset.listener = 'true';
    }
}

function onCambioEspecialidadNuevo() {
    const espId = parseInt(document.getElementById('nuevoEspecialidad').value || '0');
    const selMedico = document.getElementById('nuevoMedico');
    selMedico.innerHTML = '<option value="">Selecciona médico</option>';
    if (!espId) {
        deshabilitar('#nuevoMedico', true, 'Selecciona especialidad');
        deshabilitar('#nuevoFecha', true);
        deshabilitar('#nuevoHora', true, 'Selecciona fecha');
        actualizarResumenNuevo();
        return;
    }
    const medicosArray = obtenerMedicosArray().filter(m => m.especialidadId === espId);
    // Guardar lista para filtrado
    selMedico.dataset.medicosModal = JSON.stringify(medicosArray);
    renderMedicosModal(medicosArray);
    selMedico.disabled = false;
    prepararBusquedaMedicoModal();
}

function onCambioMedicoNuevo() {
    const medicoId = parseInt(document.getElementById('nuevoMedico').value || '0');
    const selMedico = document.getElementById('nuevoMedico');
    const opt = selMedico.options[selMedico.selectedIndex];
    const valor = opt && opt.dataset.valor ? parseFloat(opt.dataset.valor) : 0;
    document.getElementById('resumenMedico').textContent = opt && opt.textContent ? opt.textContent : '-';
    document.getElementById('resumenValor').textContent = valor.toFixed(2);
    document.getElementById('nuevoFecha').disabled = !medicoId;
    document.getElementById('nuevoHora').innerHTML = '<option value="">Selecciona fecha</option>';
    document.getElementById('nuevoHora').disabled = true;
    actualizarResumenNuevo();
}

async function cargarPacientesNuevo() {
    const sel = document.getElementById('nuevoPaciente');
    sel.innerHTML = '<option value="">Cargando pacientes...</option>';
    try {
        // Intento de cache previo
        if (cachePacientesAdmin.length === 0) {
            const resp = await fetch('https://dummyjson.com/users');
            const data = await resp.json();
            const usuarios = data.users || [];
            // Filtra role user si existe la propiedad
            cachePacientesAdmin = usuarios.filter(u => (u.role || 'user') === 'user');
        }
        sel.innerHTML = '<option value="">Selecciona paciente</option>';
        cachePacientesAdmin.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = `${u.firstName} ${u.lastName}`;
            // Guardar datos para luego
            opt.dataset.firstName = u.firstName;
            opt.dataset.lastName = u.lastName;
            sel.appendChild(opt);
        });
        sel.disabled = false;
        sel.onchange = onCambioPacienteNuevo;
        prepararBusquedaPacienteModal();
    } catch (e) {
        console.error('Error cargando pacientes:', e);
        sel.innerHTML = '<option value="">No se pudieron cargar pacientes</option>';
        sel.disabled = false;
    }
}

function cargarObrasSocialesNuevo() {
    const sel = document.getElementById('nuevoObraSocial');
    sel.innerHTML = '<option value="">Selecciona paciente</option>';
    let obrasArray = [];
    const obrasDataStr = localStorage.getItem('obrassocialesData');
    if (obrasDataStr) {
        const obrasObj = JSON.parse(obrasDataStr);
        obrasArray = obrasObj.obrasSociales || obrasObj;
    }
    if (obrasArray.length === 0 && typeof obrassocialesData !== 'undefined' && obrassocialesData.obrasSociales) {
        obrasArray = obrassocialesData.obrasSociales;
    }
    // Guardar en dataset para acceso rápido
    sel.dataset.obras = JSON.stringify(obrasArray);
}

function onCambioPacienteNuevo() {
    const sel = document.getElementById('nuevoPaciente');
    const pacienteId = sel.value;
    const selObra = document.getElementById('nuevoObraSocial');

    const obrasArray = JSON.parse(selObra.dataset.obras || '[]');
    selObra.innerHTML = '<option value="">Selecciona obra social</option>';
    obrasArray.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.id;
        opt.textContent = o.nombre;
        opt.dataset.porcentaje = o.porcentaje || 0;
        selObra.appendChild(opt);
    });
    selObra.disabled = obrasArray.length === 0;

    // Prefijar con elección previa del paciente si existe
    if (pacienteId) {
        const guardadaStr = localStorage.getItem('obraSocialSeleccionada_' + pacienteId);
        if (guardadaStr) {
            try {
                const guardada = JSON.parse(guardadaStr);
                const coincidente = [...selObra.options].find(o => parseInt(o.value||'0') === guardada.id);
                if (coincidente) {
                    selObra.value = String(guardada.id);
                }
                document.getElementById('resumenCobertura').textContent = guardada.porcentaje || 0;
            } catch {}
        }
    }
    selObra.onchange = actualizarResumenNuevo;
    actualizarResumenNuevo();
}

function cargarHorariosNuevo() {
    const medicoId = parseInt(document.getElementById('nuevoMedico').value || '0');
    const fecha = document.getElementById('nuevoFecha').value;
    const selHora = document.getElementById('nuevoHora');
    if (!medicoId || !fecha) {
        deshabilitar('#nuevoHora', true, 'Selecciona fecha');
        return;
    }
    // Obtener horarios del médico
    const horarios = obtenerHorariosPorMedico(medicoId);
    // Día de la semana en español
    const fechaObj = new Date(fecha + 'T00:00:00');
    const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const dia = dias[fechaObj.getDay()];
    const horariosDia = horarios.filter(h => h.dia === dia);

    selHora.innerHTML = '';
    if (horariosDia.length === 0) {
        selHora.innerHTML = `<option value="">El médico no atiende los ${dia}s</option>`;
        selHora.disabled = true;
        return;
    }

    const opciones = [];
    horariosDia.forEach(h => {
        const inicio = new Date(`2000-01-01 ${h.horaInicio}`);
        const fin = new Date(`2000-01-01 ${h.horaFin}`);
        let actual = new Date(inicio);
        while (actual < fin) {
            const horaStr = actual.toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit', hour12:false});
            const disponible = verificarDisponibilidad(medicoId, fecha, horaStr, h.duracionTurno || 30);
            if (disponible) opciones.push(horaStr);
            actual.setMinutes(actual.getMinutes() + (h.duracionTurno || 30));
        }
    });

    if (opciones.length === 0) {
        selHora.innerHTML = `<option value="">Sin horarios disponibles</option>`;
        selHora.disabled = true;
    } else {
        selHora.innerHTML = '<option value="">Selecciona hora</option>' + opciones.map(h => `<option value="${h}">${h}</option>`).join('');
        selHora.disabled = false;
    }
    selHora.onchange = actualizarResumenNuevo;
    actualizarResumenNuevo();
}

function actualizarResumenNuevo() {
    const selMedico = document.getElementById('nuevoMedico');
    const valor = selMedico && selMedico.selectedIndex > 0 ? parseFloat(selMedico.options[selMedico.selectedIndex].dataset.valor || '0') : 0;
    const selObra = document.getElementById('nuevoObraSocial');
    const obraId = selObra && selObra.selectedIndex > 0 ? parseInt(selObra.value || '0') : 0;
    const porcentajeSeleccionado = selObra && selObra.selectedIndex > 0 ? parseFloat(selObra.options[selObra.selectedIndex].dataset.porcentaje || '0') : 0;

    // Si el médico no acepta la obra social seleccionada, se cobra 100% (cobertura 0%)
    let porcentajeAplicado = porcentajeSeleccionado;
    let obraAceptada = true;
    const medicoId = selMedico && selMedico.selectedIndex > 0 ? parseInt(selMedico.value || '0') : 0;
    if (medicoId && obraId) {
        const medico = obtenerMedicosArray().find(m => m.id === medicoId);
        if (!medico || !Array.isArray(medico.obrasocialesId) || !medico.obrasocialesId.includes(obraId)) {
            obraAceptada = false;
            porcentajeAplicado = 0;
        }
    }

    // Mostrar aviso si no acepta la obra
    const alertaObra = document.getElementById('alertaObraNoAceptada');
    if (alertaObra) alertaObra.style.display = obraAceptada ? 'none' : 'block';

    document.getElementById('resumenValor').textContent = valor.toFixed(2);
    document.getElementById('resumenCobertura').textContent = porcentajeAplicado.toString();
    const total = valor - (valor * porcentajeAplicado / 100);
    document.getElementById('resumenTotal').textContent = total.toFixed(2);

    const ok = document.getElementById('nuevoPaciente').value && document.getElementById('nuevoMedico').value && document.getElementById('nuevoFecha').value && document.getElementById('nuevoHora').value && document.getElementById('nuevoObraSocial').value;
    document.getElementById('btnGuardarNuevoTurno').disabled = !ok;
    document.getElementById('alertaEstadoDatos').style.display = ok ? 'none' : 'block';
}

function guardarNuevoTurno() {
    const btn = document.getElementById('btnGuardarNuevoTurno');
    const spinner = document.getElementById('spinnerNuevoTurno');
    btn.disabled = true; spinner.classList.remove('d-none');

    const pacienteSel = document.getElementById('nuevoPaciente');
    const pacienteId = parseInt(pacienteSel.value);
    const firstName = pacienteSel.options[pacienteSel.selectedIndex].dataset.firstName || '';
    const lastName = pacienteSel.options[pacienteSel.selectedIndex].dataset.lastName || '';
    const medicoId = parseInt(document.getElementById('nuevoMedico').value);
    const fecha = document.getElementById('nuevoFecha').value;
    const hora = document.getElementById('nuevoHora').value;
    const obraSel = document.getElementById('nuevoObraSocial');
    const obraId = parseInt(obraSel.value);
    const obraNombre = obraSel.options[obraSel.selectedIndex].textContent;
    const obraPorcentajeSeleccionado = parseFloat(obraSel.options[obraSel.selectedIndex].dataset.porcentaje || '0');

    // Validar conflicto por seguridad
    const horarios = obtenerHorariosPorMedico(medicoId);
    const duracion = (horarios.find(h => h.dia === ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][new Date(fecha+'T00:00:00').getDay()]) || {}).duracionTurno || 30;
    const libre = verificarDisponibilidad(medicoId, fecha, hora, duracion);
    if (!libre) {
        document.getElementById('alertaConflicto').style.display = 'block';
        btn.disabled = false; spinner.classList.add('d-none');
        return;
    }

    // Determinar porcentaje a aplicar según aceptación de obra
    let obraPorcentaje = obraPorcentajeSeleccionado;
    const medicoAceptaObra = (() => {
        const medico = obtenerMedicosArray().find(m => m.id === medicoId);
        return !!(medico && Array.isArray(medico.obrasocialesId) && medico.obrasocialesId.includes(obraId));
    })();
    if (!medicoAceptaObra) {
        obraPorcentaje = 0;
    }

    const nuevoTurno = {
        pacienteId: pacienteId,
        pacienteNombre: `${firstName} ${lastName}`.trim(),
        pacienteDocumento: 'N/A',
        medicoId: medicoId,
        fecha: fecha,
        hora: hora,
        obraSocialId: obraId,
        obraSocialNombre: obraNombre,
        obraSocialPorcentaje: obraPorcentaje,
        estado: 'confirmado',
        fechaAgendado: new Date().toISOString()
    };

    try {
        agregarTurno(nuevoTurno);
        // cerrar modal
        bootstrap.Modal.getInstance(document.getElementById('modalNuevoTurno')).hide();
        // refrescar si corresponde
        const filtroMedico = parseInt(document.getElementById('filtroMedicoTurnos').value || '0');
        if (filtroMedico === medicoId) {
            cargarTurnosPorMedico();
        }
        alert('✅ Turno creado correctamente');
    } catch (e) {
        console.error('Error guardando turno', e);
        alert('❌ No se pudo crear el turno');
    } finally {
        btn.disabled = false; spinner.classList.add('d-none');
    }
}

// Cargar médicos en el selector de filtro
function cargarMedicosEnFiltro() {
    const select = document.getElementById('filtroMedicoTurnos');
    const inputBusqueda = document.getElementById('buscarMedicoFiltro');
    
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
    
    // Guardar lista completa para filtrado posterior
    select.dataset.medicos = JSON.stringify(medicosArray);
    renderMedicosFiltro(medicosArray);

    // Listener de búsqueda (una sola vez)
    if (inputBusqueda && !inputBusqueda.dataset.listener) {
        inputBusqueda.addEventListener('input', () => {
            filtrarMedicosFiltro();
        });
        inputBusqueda.dataset.listener = 'true';
    }
}

function renderMedicosFiltro(lista) {
    const select = document.getElementById('filtroMedicoTurnos');
    const valorActual = select.value;
    select.innerHTML = '<option value="">-- Selecciona médico --</option>';
    lista.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.id;
        option.textContent = `${medico.apellido}, ${medico.nombre}`;
        select.appendChild(option);
    });
    if ([...select.options].some(o => o.value === valorActual)) {
        select.value = valorActual;
    }
}

function filtrarMedicosFiltro() {
    const inputBusqueda = document.getElementById('buscarMedicoFiltro');
    const termino = (inputBusqueda.value || '').toLowerCase();
    const select = document.getElementById('filtroMedicoTurnos');
    const medicosArray = JSON.parse(select.dataset.medicos || '[]');
    if (!termino) {
        renderMedicosFiltro(medicosArray);
        return;
    }
    const filtrados = medicosArray.filter(m =>
        `${m.apellido} ${m.nombre}`.toLowerCase().includes(termino) ||
        `${m.nombre} ${m.apellido}`.toLowerCase().includes(termino)
    );
    renderMedicosFiltro(filtrados);
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
        // Usar nombre del paciente guardado en el turno
        const nombrePaciente = turno.pacienteNombre || `Paciente ID: ${turno.pacienteId}`;
        const documentoPaciente = turno.pacienteDocumento || 'N/A';
        
        // Obtener médico actual
        const medico = medicosArray.find(m => m.id === turno.medicoId);
        
        // Obtener especialidad
        const especialidad = medico ? especialidadesArray.find(e => e.id === medico.especialidadId) : null;
        const nombreEspecialidad = especialidad ? especialidad.nombre : 'N/A';
        
        // Obtener obra social (si existe en el turno)
        let obraSocialNombre = 'N/A';
        let porcentajeCobertura = 0;
        
        // Usar el porcentaje del turno si está disponible (es el más confiable)
        if (turno.obraSocialPorcentaje !== undefined && turno.obraSocialPorcentaje !== null) {
            porcentajeCobertura = turno.obraSocialPorcentaje;
        } else if (turno.obraSocialId) {
            // Fallback: buscar el porcentaje en el array
            const obra = obrasArray.find(o => o.id === turno.obraSocialId);
            if (obra) {
                porcentajeCobertura = obra.porcentaje || 0;
            }
        }
        
        // Usar el nombre de obra social del turno si está disponible
        if (turno.obraSocialNombre) {
            obraSocialNombre = turno.obraSocialNombre;
        } else if (turno.obraSocialId) {
            // Fallback: buscar por ID si no hay nombre
            const obra = obrasArray.find(o => o.id === turno.obraSocialId);
            if (obra) {
                obraSocialNombre = obra.nombre;
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
    
    // Obtener datos del paciente del turno (ya están guardados)
    const nombrePaciente = turno.pacienteNombre || 'N/A';
    const documentoPaciente = turno.pacienteDocumento || 'N/A';
    
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
    
    // Calcular valores - Usar el porcentaje guardado en el turno
    const valorConsulta = medico ? medico.valorConsulta : 0;
    const porcentajeCobertura = turno.obraSocialPorcentaje !== undefined && turno.obraSocialPorcentaje !== null 
        ? turno.obraSocialPorcentaje 
        : (obraSocial ? obraSocial.porcentaje : 0);
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
    document.getElementById('detallesNombrePaciente').textContent = nombrePaciente;
    document.getElementById('detallesDocumento').textContent = documentoPaciente;
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
    
    // Obtener datos del paciente del turno (ya están guardados)
    const nombrePaciente = turno.pacienteNombre || `Paciente ID: ${turno.pacienteId}`;
    
    turnoActualEditando = turnoId;
    
    // Llenar el formulario
    document.getElementById('turnoFecha').value = turno.fecha;
    document.getElementById('turnoHora').value = turno.hora;
    document.getElementById('turnoEstado').value = turno.estado;
    document.getElementById('turnoPacienteNombre').value = nombrePaciente;
    
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
