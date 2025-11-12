document.addEventListener('DOMContentLoaded', () => {
    // Cambios
    // Si no hay obras sociales guardadas, carga las por defecto (OSDE, etc.).
    if (typeof inicializarObrasSociales === 'function') {
        inicializarObrasSociales();
    } else {
        console.warn('La función inicializarObrasSociales no está definida. Verifique la carga de obras-sociales-data.js.');
    }

    try {
        cargarObrasSocialesEnFrontend();
    } catch (error) {
        console.error("Error al cargar las obras sociales en el frontend.", error);
    }
});

function cargarObrasSocialesEnFrontend() {
    // Obtener el contenedor
    const container = document.getElementById('obrasSocialesFrontContainer');
    if (!container) {
        console.warn('Contenedor de Obras Sociales del frontend no encontrado (ID: obrasSocialesFrontContainer).');
        return;
    }

    // 
    // Asumimos que obtenerObrasSociales ya cargo los datos desde localStorage por defecto
    const datos = obtenerObrasSociales();
    const listaObrasSociales = datos.obrasSociales || [];

    // Limpiar contenido previo
    container.innerHTML = '';

    if (listaObrasSociales.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No se encontraron obras sociales registradas.</p></div>';
        return;
    }

    // Recorrer y crear las tarjetas (cards)
    listaObrasSociales.forEach(obra => {
        // Usamos una estructura de columna
        const colDiv = document.createElement('div');
        colDiv.className = 'col-6 col-sm-4 col-md-2 d-flex justify-content-center mb-3';
        
        // Contenido de la tarjeta
        const descripcion = obra.descripcion || 'Verifique cobertura local'; 
        const nombre = obra.nombre || 'N/A';
        const imagen = obra.imagen || 'img/default-logo.jpg'; 

        colDiv.innerHTML = `
            <div class="card text-center border-0" style="width: 100%;">
                <img src="${imagen}" class="card-img-top img-fluid" alt="${nombre} Logo" 
                     onerror="this.onerror=null; this.src='img/default-logo.jpg';">
                <div class="card-body p-2">
                    <h6 class="card-title">${escapeHtml(nombre)}</h6>
                    <p class="card-text"><small>${escapeHtml(descripcion)}</small></p>
                    <p class="card-text text-success fw-bold"><small>Descuento: ${obra.porcentaje}%</small></p>
                </div>
            </div>
        `;
        
        container.appendChild(colDiv);
    });
}

// Función de escape para evitar errores si no se importa de otro lado
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
}