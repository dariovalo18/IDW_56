// verificar sesion al cargar la pagina
document.addEventListener('DOMContentLoaded', () => {
    if (!requiereSesion()) {
        return;
    }

    const verificacion = verificarSesion();
    if (verificacion.activa) {
        document.getElementById('nombreUsuario').textContent = verificacion.sesion.nombre;
    }

    // Verificar si la tabla de medicos está vacía y cargar datos por defecto
    const datos = obtenerMedicos();
    if (!datos.medicos || datos.medicos.length === 0) {
        console.log('La tabla de medicos está vacía, cargando datos por defecto...');
        inicializarMedicos();
    }

    cargarTablaMedicos();
});