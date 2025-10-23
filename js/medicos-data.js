
// inicia localStorage con los datos que estan definidos aca
function inicializarMedicos() {
    // chequea si ya hay algo guardado
    const medicosGuardados = localStorage.getItem('medicosData');
    
    //si el localstorage esta vacio o tiene un array de medicos vacio
    if (!medicosGuardados || medicosGuardados === '{"medicos":[]}') {
        // si no hay nada, guarda lo que tenemos aca
        localStorage.setItem('medicosData', JSON.stringify(medicosData));
        console.log('No hay datos en localStorage, cargamos datos por defecto.');
    } else {
        console.log('Datos de medicos ya existentes, no cargamos');
    }
}

// trae los medicos que estan guardados
function obtenerMedicos() {
    const medicosGuardados = localStorage.getItem('medicosData');
    return medicosGuardados ? JSON.parse(medicosGuardados) : medicosData;
}

// guarda los medicos en localStorage
function guardarMedicos(datos) {
    localStorage.setItem('medicosData', JSON.stringify(datos));
}

// crea las tarjetas de medicos en la pagina
function renderizarMedicos() {
    const datos = obtenerMedicos();
    const container = document.querySelector('.row.justify-content-center');
    
    // si no encuentra el contenedor, no hacer nada (estamos en otra pagina)
    if (!container) {
        return;
    }
    
    // borra lo que habia antes
    container.innerHTML = '';

    // hace una tarjeta por cada medico
    datos.medicos.forEach(medico => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'col-md-3 d-flex justify-content-center';
        // llena la tarjeta con la info del medico
        // usamos estas comillas raras para meter html de varias lineas
        tarjeta.innerHTML = `
            <div class="card text-center mb-3" style="width: 18rem;" data-especialidad="${medico.especialidad}">
                <img src="${medico.imagen}" class="card-img-top" alt="${medico.alt}">
                <div class="card-body">
                    <h5 class="card-title">${medico.nombre}</h5>
                    <p class="card-text">${medico.especialidad.charAt(0).toUpperCase() + medico.especialidad.slice(1)}</p>
                    <a href="#" class="btn btn-primary">Agendar cita</a>
                </div>
            </div>
        `;
        container.appendChild(tarjeta);
    });
    
    // arranca los filtros despues de crear las tarjetas
    configurarFiltros();
}

// hace que funcionen los botones de filtro
function configurarFiltros() {
    const radios = document.querySelectorAll('input[name="especialidad"]');
    
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            const seleccionado = document.querySelector('input[name="especialidad"]:checked').value;
            const tarjetas = document.querySelectorAll('.card[data-especialidad]');

            tarjetas.forEach(tarjeta => { 
                if (!seleccionado || tarjeta.dataset.especialidad === seleccionado) {
                    tarjeta.style.display = '';  // las muestra
                } else {
                    tarjeta.style.display = 'none'; // las oculta
                }
            });
        });
    });
}

// agrega un medico nuevo a la lista
function agregarMedico(nuevoMedico) {
    const datos = obtenerMedicos();
    nuevoMedico.id = datos.medicos.length + 1;
    datos.medicos.push(nuevoMedico);
    guardarMedicos(datos);
    
    // solo renderizar si estamos en la pagina de especialidades
    if (document.querySelector('.row.justify-content-center')) {
        renderizarMedicos();
    }
}

// borra un medico por su numero de ID
function eliminarMedico(id) {
    const datos = obtenerMedicos();
    datos.medicos = datos.medicos.filter(medico => medico.id !== id);
    guardarMedicos(datos);
    
    // solo renderizar si estamos en la pagina de especialidades
    if (document.querySelector('.row.justify-content-center')) {
        renderizarMedicos();
    }
}

// cambia los datos de un medico que ya existe
function actualizarMedico(id, datosActualizados) {
    const datos = obtenerMedicos();
    const index = datos.medicos.findIndex(medico => medico.id === id);
    if (index !== -1) {
        datos.medicos[index] = { ...datos.medicos[index], ...datosActualizados };
        guardarMedicos(datos);
        
        // solo renderizar si estamos en la pagina de especialidades
        if (document.querySelector('.row.justify-content-center')) {
            renderizarMedicos();
        }
    }
}

// esto se ejecuta cuando se carga la pagina
document.addEventListener('DOMContentLoaded', () => {
    inicializarMedicos();
    renderizarMedicos();
});