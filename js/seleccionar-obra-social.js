// Variable para guardar la obra social seleccionada temporalmente
let obraSocialSeleccionada = null;

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que el usuario está logueado como paciente (no admin)
    const sesion = JSON.parse(localStorage.getItem('sesion'));
    
    if (!sesion) {
        // Si no hay sesión, redirigir a login
        window.location.href = 'admin.html';
        return;
    }
    
    if (sesion.role === 'admin') {
        // Admins no pueden estar aquí, redirigir a admin-medicos
        window.location.href = 'admin-medicos.html';
        return;
    }
    
    // Verificar si viene para cambiar obra social (tiene parámetro cambiar en URL)
    const urlParams = new URLSearchParams(window.location.search);
    const esCambio = urlParams.get('cambiar') === 'true';
    
    // Si ya seleccionó obra social Y no viene a cambiarla, redirigir a agendar
    if (sesion.obraSocialId && !esCambio) {
        window.location.href = 'paciente-agendar.html';
        return;
    }
    
    // Cargar obras sociales
    cargarObrasSociales();
});

// Cargar y mostrar opciones de obras sociales
function cargarObrasSociales() {
    let obrasArray = [];
    
    // Obtener obras sociales SOLO de localStorage
    const obrasDataStr = localStorage.getItem('obrassocialesData');
    if (obrasDataStr) {
        const obrasObj = JSON.parse(obrasDataStr);
        obrasArray = obrasObj.obrasSociales || obrasObj;
    }
    
    // Si no hay en localStorage, intentar con datos iniciales como último recurso
    if (obrasArray.length === 0 && typeof obrassocialesData !== 'undefined' && obrassocialesData.obrasSociales) {
        obrasArray = obrassocialesData.obrasSociales;
        // Guardar en localStorage para usos futuros
        localStorage.setItem('obrassocialesData', JSON.stringify(obrassocialesData));
    }
    
    const container = document.getElementById('obrassocialesContainer');
    
    if (obrasArray.length === 0) {
        container.innerHTML = `
            <div class="alert alert-warning">
                No hay obras sociales disponibles en este momento.
            </div>
        `;
        return;
    }
    
    // Crear tarjetas para cada obra social
    container.innerHTML = obrasArray.map(obra => `
        <div class="card mb-3 cursor-pointer obra-social-card" onclick="seleccionarObraSocial(${obra.id}, '${obra.nombre}', ${obra.porcentaje})" style="cursor: pointer; transition: all 0.3s;">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h5 class="card-title">${obra.nombre}</h5>
                        <p class="card-text text-muted">ID: ${obra.id}</p>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="badge bg-success fs-5">
                            ${obra.porcentaje}% de cobertura
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Agregar efecto hover a las tarjetas
    document.querySelectorAll('.obra-social-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            this.style.transform = 'translateY(-2px)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
            this.style.transform = 'translateY(0)';
        });
    });
}

// Seleccionar una obra social
function seleccionarObraSocial(id, nombre, porcentaje) {
    // Validar y obtener el porcentaje correcto del localStorage
    let obrasArray = [];
    const obrasDataStr = localStorage.getItem('obrassocialesData');
    if (obrasDataStr) {
        const obrasObj = JSON.parse(obrasDataStr);
        obrasArray = obrasObj.obrasSociales || obrasObj;
    }
    
    if (obrasArray.length === 0 && obrassocialesData && obrassocialesData.obrasSociales) {
        obrasArray = obrassocialesData.obrasSociales;
    }
    
    // Buscar la obra social en el array para obtener el porcentaje exacto
    const obraEncontrada = obrasArray.find(o => o.id === id);
    const porcentajeCorrecta = obraEncontrada ? obraEncontrada.porcentaje : porcentaje;
    
    obraSocialSeleccionada = {
        id: id,
        nombre: nombre,
        porcentaje: porcentajeCorrecta
    };
    
    // Mostrar confirmación en el modal
    document.getElementById('nombreObraConfirm').textContent = nombre;
    document.getElementById('porcentajeObraConfirm').textContent = porcentajeCorrecta;
    
    // Abrir modal de confirmación
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmarObra'));
    modal.show();
}

// Confirmar selección de obra social
function confirmarObraSocial() {
    if (!obraSocialSeleccionada) {
        alert('Por favor selecciona una obra social');
        return;
    }
    
    // Guardar obra social en la sesión del paciente
    const sesion = JSON.parse(localStorage.getItem('sesion'));
    sesion.obraSocialId = obraSocialSeleccionada.id;
    sesion.obraSocialNombre = obraSocialSeleccionada.nombre;
    sesion.obraSocialPorcentaje = obraSocialSeleccionada.porcentaje;
    
    localStorage.setItem('sesion', JSON.stringify(sesion));
    
    // También guardar la obra social seleccionada de forma persistente para futuras sesiones
    const obraSocialGuardada = {
        id: obraSocialSeleccionada.id,
        nombre: obraSocialSeleccionada.nombre,
        porcentaje: obraSocialSeleccionada.porcentaje,
        pacienteId: sesion.id,
        fechaSeleccion: new Date().toISOString()
    };
    localStorage.setItem('obraSocialSeleccionada_' + sesion.id, JSON.stringify(obraSocialGuardada));
    
    // Cerrar modal
    bootstrap.Modal.getInstance(document.getElementById('modalConfirmarObra')).hide();
    
    // Redirigir a la página de agendar turnos
    setTimeout(() => {
        window.location.href = 'paciente-agendar.html';
    }, 500);
}
