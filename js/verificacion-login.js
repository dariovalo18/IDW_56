// verificar sesion al cargar la pagina
document.addEventListener('DOMContentLoaded', () => {
    if (!requiereSesion()) {
        return;
    }

    const verificacion = verificarSesion();
    if (verificacion.activa) {
        document.getElementById('nombreUsuario').textContent = verificacion.sesion.nombre;
    }

    cargarTablaMedicos();
});