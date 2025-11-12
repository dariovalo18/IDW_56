// obras-sociales-data.js
// Manejo de datos de Obras Sociales (usa localStorage)
// Cambios: se agregó el campo "porcentaje" en los objetos de obra social
// y funciones se adaptaron para manejarlo.

const OBRAS_SOCIALES_KEY = 'obrasSocialesData';

let obrasSociales = [];

// Inicializa datos por defecto si no hay nada en localStorage
function inicializarObrasSociales() {
    const guardado = localStorage.getItem(OBRAS_SOCIALES_KEY);
    if (!guardado) {
        obrasSociales = [
            { id: 1, nombre: "OSDE", porcentaje: 10, descripcion: "Cobertura nacional de OSDE", imagen: "img/osde-logo.jpg" },
            { id: 2, nombre: "Swiss Medical", porcentaje: 15, descripcion: "Cobertura nacional de Swiss Medical", imagen: "img/swiss-medical-logo.jpeg" },
            { id: 3, nombre: "Galeno", porcentaje: 20, descripcion: "Cobertura en Buenos Aires", imagen: "img/galeno-logo.jpeg" }
        ];
        guardarObrasSociales();
        console.log('Datos de obras sociales inicializados por defecto.');
    } else {
        obrasSociales = JSON.parse(guardado).obrasSociales || [];
        console.log('Datos de obras sociales cargados desde localStorage.');
    }
}

// Devuelve los datos actuales
function obtenerObrasSociales() {
    return { obrasSociales };
}

// Guarda en localStorage (estructura { obrasSociales: [...] })
function guardarObrasSociales() {
    localStorage.setItem(OBRAS_SOCIALES_KEY, JSON.stringify({ obrasSociales }));
}

// Agrega una nueva obra social (espera objeto { nombre, porcentaje })
function agregarObraSocial(obra) {
    // generar id incremental
    const maxId = obrasSociales.reduce((acc, o) => Math.max(acc, o.id), 0);
    obra.id = maxId + 1;

    // asegurar porcentaje numérico entre 0 y 100
    obra.porcentaje = Number.isFinite(Number(obra.porcentaje)) ? parseInt(obra.porcentaje, 10) : 0;
    if (obra.porcentaje < 0) obra.porcentaje = 0;
    if (obra.porcentaje > 100) obra.porcentaje = 100;

    // aseguramos que existan los campos descripcion e imagen
    obra.descripcion = obra.descripcion || '';
    obra.imagen = obra.imagen || '';

    obrasSociales.push(obra);
    guardarObrasSociales();
}

// Edita una obra social existente (id, nombre, porcentaje)
function editarObraSocial(id, nombre, porcentaje, descripcion, imagen) {
    const index = obrasSociales.findIndex(o => o.id === id);
    if (index !== -1) {
        obrasSociales[index].nombre = nombre;

        // porcentaje ya validado como antes
        obrasSociales[index].porcentaje = Number.isFinite(Number(porcentaje)) ? parseInt(porcentaje, 10) : obrasSociales[index].porcentaje;
        if (obrasSociales[index].porcentaje < 0) obrasSociales[index].porcentaje = 0;
        if (obrasSociales[index].porcentaje > 100) obrasSociales[index].porcentaje = 100;

        // campos nuevos
        obrasSociales[index].descripcion = descripcion || '';
        obrasSociales[index].imagen = imagen || '';

        guardarObrasSociales();
    } else {
        console.warn('editarObraSocial: id no encontrado', id);
    }
}

// Elimina una obra social por id
function eliminarObraSocial(id) {
    obrasSociales = obrasSociales.filter(o => o.id !== id);
    guardarObrasSociales();
}

