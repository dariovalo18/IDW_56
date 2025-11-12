// verificar sesion al cargar la pagina
document.addEventListener('DOMContentLoaded', () => {
    if (!requiereSesion()) {
        return;
    }

    const verificacion = verificarSesion();
    if (verificacion.activa) {
        const elemento = document.getElementById('nombreUsuario');
        if (elemento) {
            elemento.textContent = verificacion.sesion.nombre;
        }
    }

    // Verificar si la tabla de medicos está vacía y cargar datos por defecto
    try {
        const datos = obtenerMedicos();
        if (!datos.medicos || datos.medicos.length === 0) {
            console.log('La tabla de medicos está vacía, cargando datos por defecto...');
            inicializarMedicos();
        }
    } catch (e) {
        // las funciones de medicos no existen en esta página
        console.log('No hay funciones de medicos en esta página');
    }

    // solo cargar tabla si la página lo requiere
    if (document.getElementById('tablaMedicos') && typeof cargarTablaMedicos === 'function') {
        cargarTablaMedicos();
    }
});