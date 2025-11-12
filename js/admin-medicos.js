// variables globales para el admin
let medicoEditandoId = null;
let modalMedico = null;
let modalEliminar = null;
let especialidades = [];
let obrasSociales = [];

// inicializar modales cuando se carga la pagina
document.addEventListener('DOMContentLoaded', () => {
    modalMedico = new bootstrap.Modal(document.getElementById('modalMedico'));
    modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminar'));

    // cargar especialidades y obras sociales
    cargarEspecialidades();
    cargarObrasSociales();
    cargarTablaMedicos();

    // configurar vista previa de imagen
    document.getElementById('medicoImagen').addEventListener('input', mostrarVistaPrevia);
});

// cargar especialidades y llenar el select
function cargarEspecialidades() {
    const especialidadesGuardadas = localStorage.getItem('especialidadesData');
    if (especialidadesGuardadas) {
        const datos = JSON.parse(especialidadesGuardadas);
        especialidades = datos.especialidades || [];
    } else {
        especialidades = especialidadesData.especialidades || [];
    }
    
    const select = document.getElementById('medicoEspecialidad');
    select.innerHTML = '<option value="">Selecciona una especialidad</option>';
    especialidades.forEach(esp => {
        const option = document.createElement('option');
        option.value = esp.id;
        option.textContent = esp.nombre;
        select.appendChild(option);
    });
}

// cargar obras sociales y mostrar checkboxes
function cargarObrasSociales() {
    const obrasGuardadas = localStorage.getItem('obrassocialesData');
    if (obrasGuardadas) {
        const datos = JSON.parse(obrasGuardadas);
        obrasSociales = datos.obrasSociales || [];
    } else {
        obrasSociales = obrassocialesData.obrasSociales || [];
    }
    
    const container = document.getElementById('medicoObrasSociales');
    container.innerHTML = '';
    obrasSociales.forEach(obra => {
        const div = document.createElement('div');
        div.className = 'form-check';
        div.innerHTML = `
            <input class="form-check-input obra-social-check" type="checkbox" value="${obra.id}" id="obra${obra.id}" name="obrasocialesId">
            <label class="form-check-label" for="obra${obra.id}">
                ${obra.nombre} (${obra.porcentaje}%)
            </label>
        `;
        container.appendChild(div);
    });
}

// obtener IDs de obras sociales seleccionadas
function obtenerObrasSelectas() {
    const checkboxes = document.querySelectorAll('.obra-social-check:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

// carga la tabla con todos los medicos
function cargarTablaMedicos() {
    const datos = obtenerMedicos();
    const tbody = document.getElementById('tablaMedicos');

    tbody.innerHTML = '';

    if (datos.medicos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    No hay médicos registrados. <a href="#" onclick="abrirModalAgregar()">Agregar el primero</a>
                </td>
            </tr>
        `;
        return;
    }

    datos.medicos.forEach(medico => {
        // buscar el nombre de la especialidad
        const especialidad = especialidades.find(e => e.id === medico.especialidadId);
        const nombreEspecialidad = especialidad ? especialidad.nombre : 'N/A';
        
        // asegurar que los campos tengan valores por defecto
        const valorConsulta = medico.valorConsulta || 0;
        const matricula = medico.matricula || medico.id;
        const apellido = medico.apellido || '';
        const nombre = medico.nombre || 'N/A';
        
        // construir nombre completo sin coma si no hay apellido
        const nombreCompleto = apellido ? `${apellido}, ${nombre}` : nombre;
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><strong>${matricula}</strong></td>
            <td>
                <img src="${medico.imagen}" alt="${medico.alt}" class="preview-img" 
                     onerror="this.src='img/default-doctor.jpg'; this.alt='Imagen no disponible';">
            </td>
            <td>${nombreCompleto}</td>
            <td><span class="badge bg-primary">${nombreEspecialidad}</span></td>
            <td><strong>$${valorConsulta.toFixed(2)}</strong></td>
            <td>
                <button class="btn btn-info btn-action btn-sm" onclick="irAVerTurnos(${medico.id})" title="Ver Turnos">
                    Ver Turnos
                </button>
                <button class="btn btn-warning btn-action btn-sm" onclick="abrirModalEditar(${medico.id})" title="Editar">
                    Editar
                </button>
                <button class="btn btn-danger btn-action btn-sm" onclick="abrirModalEliminar(${medico.id})" title="Eliminar">
                    Eliminar
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// abre el modal para agregar un medico nuevo
function abrirModalAgregar() {
    medicoEditandoId = null;
    document.getElementById('modalTitulo').textContent = 'Agregar Médico';
    document.getElementById('formMedico').reset();
    document.getElementById('previewContainer').style.display = 'none';
    
    // limpiar checkboxes de obras sociales
    document.querySelectorAll('.obra-social-check').forEach(cb => cb.checked = false);
    
    modalMedico.show();
}

// abre el modal para editar un medico existente
function abrirModalEditar(id) {
    const datos = obtenerMedicos();
    const medico = datos.medicos.find(m => m.id === id);

    if (!medico) {
        alert('No se encontro el medico');
        return;
    }

    medicoEditandoId = id;
    document.getElementById('modalTitulo').textContent = 'Editar Médico';

    // llenar el formulario con los datos actuales (con valores por defecto)
    document.getElementById('medicoId').value = medico.id || '';
    document.getElementById('medicoMatricula').value = medico.matricula || medico.id || '';
    document.getElementById('medicoApellido').value = medico.apellido || '';
    document.getElementById('medicoNombre').value = medico.nombre || '';
    document.getElementById('medicoEspecialidad').value = medico.especialidadId || '';
    document.getElementById('medicoDescripcion').value = medico.descripcion || '';
    document.getElementById('medicoValorConsulta').value = medico.valorConsulta || '';
    document.getElementById('medicoImagen').value = medico.imagen || '';
    document.getElementById('medicoAlt').value = medico.alt || '';

    // seleccionar obras sociales (con valor por defecto si no existen)
    const obrasIds = medico.obrasocialesId || [];
    document.querySelectorAll('.obra-social-check').forEach(cb => {
        cb.checked = obrasIds.includes(parseInt(cb.value));
    });

    // mostrar vista previa
    mostrarVistaPrevia();

    modalMedico.show();
}

// guarda el medico (nuevo o editado)
function guardarMedico() {
    const form = document.getElementById('formMedico');

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
    const nuevoMedico = {
        matricula: parseInt(document.getElementById('medicoMatricula').value),
        apellido: document.getElementById('medicoApellido').value,
        nombre: document.getElementById('medicoNombre').value,
        especialidadId: parseInt(document.getElementById('medicoEspecialidad').value),
        descripcion: document.getElementById('medicoDescripcion').value,
        obrasocialesId: obtenerObrasSelectas(),
        valorConsulta: parseFloat(document.getElementById('medicoValorConsulta').value),
        imagen: document.getElementById('medicoImagen').value,
        alt: document.getElementById('medicoAlt').value
    };

    // validar que los campos requeridos esten completos
    if (!nuevoMedico.matricula || !nuevoMedico.apellido || !nuevoMedico.nombre || 
        !nuevoMedico.especialidadId || !nuevoMedico.descripcion || !nuevoMedico.valorConsulta) {
        mostrarNotificacion('Por favor completa todos los campos requeridos', 'error');
        btnTexto.textContent = 'Guardar';
        btnSpinner.classList.add('d-none');
        return;
    }

    // simular delay para el loading
    setTimeout(() => {
        try {
            if (medicoEditandoId) {
                // editar medico existente
                actualizarMedico(medicoEditandoId, nuevoMedico);
                mostrarNotificacion('Médico actualizado correctamente', 'success');
            } else {
                // agregar medico nuevo
                agregarMedico(nuevoMedico);
                mostrarNotificacion('Médico agregado correctamente', 'success');
            }

            // recargar tabla y cerrar modal
            cargarTablaMedicos();
            modalMedico.hide();

        } catch (error) {
            mostrarNotificacion('Error al guardar el médico', 'error');
        } finally {
            // restaurar boton
            btnTexto.textContent = 'Guardar';
            btnSpinner.classList.add('d-none');
        }
    }, 800);
}

// abre el modal de confirmacion para eliminar
function abrirModalEliminar(id) {
    const datos = obtenerMedicos();
    const medico = datos.medicos.find(m => m.id === id);

    if (!medico) {
        alert('No se encontro el medico');
        return;
    }

    medicoEditandoId = id;
    document.getElementById('medicoEliminarNombre').textContent = medico.nombre;
    modalEliminar.show();
}

// confirma y ejecuta la eliminacion
function confirmarEliminar() {
    if (!medicoEditandoId) {
        return;
    }

    try {
        eliminarMedico(medicoEditandoId);
        cargarTablaMedicos();
        modalEliminar.hide();
        mostrarNotificacion('Médico eliminado correctamente', 'success');
    } catch (error) {
        mostrarNotificacion('Error al eliminar el médico', 'error');
    }

    medicoEditandoId = null;
}

// muestra vista previa de la imagen
function mostrarVistaPrevia() {
    const urlImagen = document.getElementById('medicoImagen').value;
    const previewContainer = document.getElementById('previewContainer');
    const previewImg = document.getElementById('previewImg');

    if (urlImagen) {
        previewImg.src = urlImagen;
        previewImg.onerror = function () {
            this.src = 'img/default-doctor.jpg';
            this.alt = 'Imagen no válida';
        };
        previewContainer.style.display = 'block';
    } else {
        previewContainer.style.display = 'none';
    }
}

// muestra notificaciones toast
function mostrarNotificacion(mensaje, tipo = 'success') {
    // crear el toast
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

    // remover el toast despues de que se oculte
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

// redirigir a la pagina de turnos del medico
function irAVerTurnos(medicoId) {
    // Guardar el ID del médico en sessionStorage
    sessionStorage.setItem('medicoSeleccionadoId', medicoId);
    // Redirigir a la página de turnos
    window.location.href = 'admin-turnos-medicos.html';
}