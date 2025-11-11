// admin-obras-sociales.js
// Interacción UI: cargar tabla, abrir modales, guardar/editar/eliminar
// Usa las funciones definidas en obras-sociales-data.js

document.addEventListener('DOMContentLoaded', () => {
    inicializarObrasSociales();      // del archivo de datos
    cargarTablaObrasSociales();      // cargar vista
});

// Cargar la tabla (genera filas con ID, Nombre, Porcentaje y Acciones)
function cargarTablaObrasSociales() {
    const tabla = document.getElementById('tablaObrasSociales');
    tabla.innerHTML = '';

    const datos = obtenerObrasSociales();
    const lista = datos.obrasSociales || [];

    if (lista.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    No hay obras sociales registradas. 
                    <a href="#" onclick="abrirModalAgregar(); return false;">Agregar una</a>
                </td>
            </tr>
        `;
        return;
    }

    lista.forEach(obra => {
        // IMPORTANTE: 4 <td> para coincidir con <th> (ID, Nombre, Porcentaje, Acciones)
        tabla.innerHTML += `
            <tr>
                <td>${obra.id}</td>
                <td>${escapeHtml(obra.nombre)}</td>
                <td>${obra.porcentaje}%</td> 
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="abrirModalEditar(${obra.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="abrirModalEliminar(${obra.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// Abre modal para agregar (resetea formulario)
function abrirModalAgregar() {
    const form = document.getElementById('formObraSocial');
    form.reset();
    document.getElementById('obraSocialId').value = '';
    document.getElementById('modalObraSocial').querySelector('.modal-title').textContent = 'Agregar Obra Social';
    const modal = new bootstrap.Modal(document.getElementById('modalObraSocial'));
    modal.show();
}

// Abre modal para editar (carga datos en inputs)
// NOTA: usa los mismos ids que tu HTML: obraSocialId, obraSocialNombre, obraPorcentaje
function abrirModalEditar(id) {
    const datos = obtenerObrasSociales();
    const obra = (datos.obrasSociales || []).find(o => o.id === id);
    if (!obra) {
        alert('No se encontró la obra social.');
        return;
    }

    document.getElementById('obraSocialId').value = obra.id;
    document.getElementById('obraSocialNombre').value = obra.nombre;
    document.getElementById('obraPorcentaje').value = obra.porcentaje;

    document.getElementById('modalObraSocial').querySelector('.modal-title').textContent = 'Editar Obra Social';
    const modal = new bootstrap.Modal(document.getElementById('modalObraSocial'));
    modal.show();
}

// Guardar (nuevo o editar)
function guardarObraSocial() {
    const idRaw = document.getElementById('obraSocialId').value;
    const nombre = document.getElementById('obraSocialNombre').value.trim();
    const porcentajeRaw = document.getElementById('obraPorcentaje').value;

    // validaciones básicas
    if (!nombre) {
        alert('El nombre es obligatorio.');
        return;
    }
    const porcentaje = parseInt(porcentajeRaw, 10);
    if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
        alert('El porcentaje debe ser un número entre 0 y 100.');
        return;
    }

    if (idRaw && idRaw !== '') {
        const id = parseInt(idRaw, 10);
        // Llama a la función de datos: editarObraSocial(id, nombre, porcentaje)
        editarObraSocial(id, nombre, porcentaje);
        mostrarToast('Obra social actualizada', 'success');
    } else {
        // Llama a la función de datos: agregarObraSocial({ nombre, porcentaje })
        agregarObraSocial({ nombre, porcentaje });
        mostrarToast('Obra social agregada', 'success');
    }

    // cerrar modal y recargar tabla
    const modalEl = document.getElementById('modalObraSocial');
    const modalInst = bootstrap.Modal.getInstance(modalEl);
    if (modalInst) modalInst.hide();

    cargarTablaObrasSociales();
}

// Abrir modal confirmar eliminación
function abrirModalEliminar(id) {
    const datos = obtenerObrasSociales();
    const obra = (datos.obrasSociales || []).find(o => o.id === id);
    if (!obra) return;

    document.getElementById('obraSocialEliminarNombre').textContent = obra.nombre;

    const modal = document.getElementById('modalEliminar');
    // aseguramos reemplazar la acción previa
    const botonEliminar = modal.querySelector('.btn-danger');
    // limpiar onclick previo
    botonEliminar.onclick = null;
    botonEliminar.addEventListener('click', function handler() {
        eliminarObraSocial(id);
        cargarTablaObrasSociales();
        // cerrar modal
        bootstrap.Modal.getInstance(modal).hide();
        // remover handler para evitar duplicados
        botonEliminar.removeEventListener('click', handler);
        mostrarToast('Obra social eliminada', 'success');
    });

    new bootstrap.Modal(modal).show();
}

// Helpers - utilidades
// Mensaje toast simple (usa bootstrap toasts o fallback alert)
function mostrarToast(mensaje, tipo = 'success') {
    // intenta crear un toast sencillo mediante DOM
    const containerId = 'toastContainer';
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    const bgClass = tipo === 'success' ? 'bg-success' : 'bg-danger';
    container.insertAdjacentHTML('beforeend', `
        <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
            <div class="toast-body">${escapeHtml(mensaje)}</div>
        </div>
    `);
    const toastEl = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastEl);
    bsToast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// Evita inyección básica al renderizar texto
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
}
