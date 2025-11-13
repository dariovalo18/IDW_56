document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('especialidades-front.js cargado');

        // Inicializar datos en localStorage si no existen
        if (!localStorage.getItem("especialidadesData")) {
            if (typeof especialidadesData !== 'undefined') {
                localStorage.setItem("especialidadesData", JSON.stringify(especialidadesData));
            }
        }
        if (!localStorage.getItem("medicosData")) {
            if (typeof medicosData !== 'undefined') {
                localStorage.setItem("medicosData", JSON.stringify(medicosData));
            }
        }

        // Cargar datos
        const datosEspecialidades = JSON.parse(localStorage.getItem("especialidadesData") || '{"especialidades":[]}');
        const especialidades = datosEspecialidades.especialidades || [];
        
        const datosMedicos = JSON.parse(localStorage.getItem("medicosData") || '{"medicos":[]}');
        const medicos = datosMedicos.medicos || [];

        console.log('Especialidades:', especialidades);
        console.log('Médicos:', medicos);

        // Crear botones de especialidades
        const contenedorEspecialidades = document.getElementById("especialidadesContainer");
        if (!contenedorEspecialidades) {
            console.error('No se encontró #especialidadesContainer');
            return;
        }

        contenedorEspecialidades.innerHTML = '';

        // Botón "Todas" primero
        const inputTodas = document.createElement("input");
        inputTodas.type = "radio";
        inputTodas.className = "btn-check filtro";
        inputTodas.name = "especialidad";
        inputTodas.id = "btnTodos";
        inputTodas.value = "";
        inputTodas.autocomplete = "off";
        inputTodas.checked = true;

        const labelTodas = document.createElement("label");
        labelTodas.className = "btn btn-outline-secondary m-1";
        labelTodas.htmlFor = "btnTodos";
        labelTodas.textContent = "Todas";

        contenedorEspecialidades.appendChild(inputTodas);
        contenedorEspecialidades.appendChild(labelTodas);

        // Función para filtrar y renderizar médicos
        function filtrarMedicos(especialidadId) {
            const contenedorMedicos = document.querySelector('.container > .row') || document.querySelector('.mb-2.container');
            if (!contenedorMedicos) {
                console.error('No se encontró el contenedor de médicos');
                return;
            }

            // Limpiar y recrear estructura si es necesario
            if (!contenedorMedicos.classList.contains('row')) {
                contenedorMedicos.innerHTML = '<div class="row justify-content-center"></div>';
            }

            const rowContainer = contenedorMedicos.querySelector('.row') || contenedorMedicos;
            rowContainer.innerHTML = '';

            // Filtrar médicos por especialidadId
            const medicosFiltrados = especialidadId 
                ? medicos.filter(m => m.especialidadId == especialidadId)
                : medicos;

            console.log('Filtrados por especialidad', especialidadId, ':', medicosFiltrados);

            if (medicosFiltrados.length === 0) {
                rowContainer.innerHTML = '<div class="col-12"><p class="text-center">No hay médicos en esta especialidad.</p></div>';
                return;
            }

            // Crear tarjetas de médicos
            medicosFiltrados.forEach(medico => {
                const card = document.createElement('div');
                card.className = 'col-md-3 mb-3';
                
                // Obtener nombre de especialidad
                const especialidad = especialidades.find(e => e.id === medico.especialidadId);
                const nombreEspecialidad = especialidad ? especialidad.nombre : 'N/A';
                
                card.innerHTML = `
                    <div class="card h-100">
                        <img src="${medico.imagen || 'img/default-doctor.jpg'}" class="medico-card-img" alt="${medico.alt || 'Médico'}" onerror="this.src='img/default-doctor.jpg'; this.alt='Imagen no disponible';">
                        <div class="card-body">
                            <h5 class="card-title">${medico.apellido || ''}, ${medico.nombre || 'N/A'}</h5>
                            <p class="card-text text-muted"><small>${nombreEspecialidad}</small></p>
                            <p class="card-text"><small>${medico.descripcion || 'Sin descripción'}</small></p>
                            <p class="card-text"><strong>Consulta: $${medico.valorConsulta || '0'}</strong></p>
                            <a href="admin.html" class="btn btn-primary btn-sm">Agendar cita</a>
                        </div>
                    </div>
                `;
                rowContainer.appendChild(card);
            });
        }

        // Agregar botones de especialidades
        especialidades.forEach((esp) => {
            const input = document.createElement("input");
            input.type = "radio";
            input.className = "btn-check filtro";
            input.name = "especialidad";
            input.id = `btnEsp${esp.id}`;
            input.value = esp.id;
            input.autocomplete = "off";

            const label = document.createElement("label");
            label.className = "btn btn-outline-primary m-1";
            label.htmlFor = input.id;
            label.textContent = esp.nombre;

            contenedorEspecialidades.appendChild(input);
            contenedorEspecialidades.appendChild(label);

            // Agregar evento de filtro
            input.addEventListener('change', () => {
                console.log('Filtrar por especialidad:', esp.id);
                filtrarMedicos(esp.id);
            });
        });

        // Evento para botón "Todas"
        inputTodas.addEventListener('change', () => {
            console.log('Mostrar todos los médicos');
            filtrarMedicos(null);
        });

        // Cargar médicos iniciales (todas las especialidades)
        filtrarMedicos(null);

    } catch (err) {
        console.error('Error en especialidades-front.js:', err);
    }
});