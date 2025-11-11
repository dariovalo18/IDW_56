// inicia localStorage con los datos que estan definidos
function inicializarEspecialidades() {
    const especialidadesGuardadas = localStorage.getItem('especialidadesData');

    // si el localstorage esta vacio o tiene un array de especialidades vacio
    if (!especialidadesGuardadas || especialidadesGuardadas === '{"especialidades":[]}') {
        localStorage.setItem('especialidadesData', JSON.stringify(especialidadesData));
        console.log('No hay datos de especialidades en localStorage, cargamos datos por defecto.');
    } else {
        console.log('Datos de especialidades ya existentes, no cargamos');
    }
}

// trae las especialidades que estan guardadas
function obtenerEspecialidades() {
    const especialidadesGuardadas = localStorage.getItem('especialidadesData');
    if (especialidadesGuardadas) {
        return JSON.parse(especialidadesGuardadas);
    } else {
        // Si no hay nada, inicializa y devuelve los datos por defecto
        inicializarEspecialidades();
        return especialidadesData;
    }
}

// guarda las especialidades en localStorage
function guardarEspecialidades(datos) {
    localStorage.setItem('especialidadesData', JSON.stringify(datos));
}

// agrega una especialidad nueva a la lista
function agregarEspecialidad(nuevaEspecialidad) {
    const datos = obtenerEspecialidades();
    
    // Generar nuevo ID (tomando el maximo ID actual + 1)
    let maxId = 0;
    datos.especialidades.forEach(e => {
        if (e.id > maxId) {
            maxId = e.id;
        }
    });
    nuevaEspecialidad.id = maxId + 1;
    
    datos.especialidades.push(nuevaEspecialidad);
    guardarEspecialidades(datos);
}

// borra una especialidad por su numero de ID
function eliminarEspecialidad(id) {
    const datos = obtenerEspecialidades();
    datos.especialidades = datos.especialidades.filter(especialidad => especialidad.id !== id);
    guardarEspecialidades(datos);
}

// cambia los datos de una especialidad que ya existe
function actualizarEspecialidad(id, datosActualizados) {
    const datos = obtenerEspecialidades();
    const index = datos.especialidades.findIndex(especialidad => especialidad.id === id);
    if (index !== -1) {
        // Solo actualizamos el nombre, que es el unico dato editable
        datos.especialidades[index].nombre = datosActualizados.nombre;
        guardarEspecialidades(datos);
    }
}