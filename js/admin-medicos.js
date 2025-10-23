// variables globales para el admin
let medicoEditandoId = null;
let modalMedico = null;
let modalEliminar = null;

// inicializar modales cuando se carga la pagina
document.addEventListener('DOMContentLoaded', () => {
    modalMedico = new bootstrap.Modal(document.getElementById('modalMedico'));
    modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminar'));
    
    // configurar vista previa de imagen
    document.getElementById('medicoImagen').addEventListener('input', mostrarVistaPrevia);
});

// carga la tabla con todos los medicos
function cargarTablaMedicos() {
    const datos = obtenerMedicos();
    const tbody = document.getElementById('tablaMedicos');
    
    tbody.innerHTML = '';
    
    if (datos.medicos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    No hay médicos registrados. <a href="#" onclick="abrirModalAgregar()">Agregar el primero</a>
                </td>
            </tr>
        `;
        return;
    }
    
    datos.medicos.forEach(medico => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${medico.id}</td>
            <td>
                <img src="${medico.imagen}" alt="${medico.alt}" class="preview-img" 
                     onerror="this.src='img/default-doctor.jpg'; this.alt='Imagen no disponible';">
            </td>
            <td>${medico.nombre}</td>
            <td><span class="badge bg-primary">${medico.especialidad.charAt(0).toUpperCase() + medico.especialidad.slice(1)}</span></td>
            <td>
                <button class="btn btn-warning btn-action" onclick="abrirModalEditar(${medico.id})" title="Editar">
                    Editar
                </button>
                <button class="btn btn-danger btn-action" onclick="abrirModalEliminar(${medico.id})" title="Eliminar">
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
    
    // llenar el formulario con los datos actuales
    document.getElementById('medicoId').value = medico.id;
    document.getElementById('medicoNombre').value = medico.nombre;
    document.getElementById('medicoEspecialidad').value = medico.especialidad;
    document.getElementById('medicoImagen').value = medico.imagen;
    document.getElementById('medicoAlt').value = medico.alt;
    
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
    const datosFormulario = new FormData(form);
    const nuevoMedico = {
        nombre: datosFormulario.get('nombre'),
        especialidad: datosFormulario.get('especialidad'),
        imagen: datosFormulario.get('imagen'),
        alt: datosFormulario.get('alt')
    };
    
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
        previewImg.onerror = function() {
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
    document.getElementById(toastId).addEventListener('hidden.bs.toast', function() {
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