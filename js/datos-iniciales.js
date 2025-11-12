// Datos por defecto de los medicos
const medicosData = {
    medicos: [
        {
            id: 1,
            matricula: 123456,
            apellido: "Gómez",
            nombre: "Analía",
            especialidadId: 1,
            descripcion: "Cardióloga con 15 años de experiencia en diagnóstico y tratamiento de enfermedades cardiovasculares. Especializada en cardiología pediátrica.",
            obrasocialesId: [1, 2, 3],
            imagen: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amalia",
            alt: "Dra. Analía Gómez",
            valorConsulta: 500.00
        },
        {
            id: 2,
            matricula: 234567,
            apellido: "López",
            nombre: "Carlos",
            especialidadId: 2,
            descripcion: "Pediatra con 10 años de experiencia en atención integral de niños. Especializado en pediatría general y neonatología.",
            obrasocialesId: [1, 2, 4],
            imagen: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
            alt: "Dr. Carlos López",
            valorConsulta: 400.00
        },
        {
            id: 3,
            matricula: 345678,
            apellido: "Rodríguez",
            nombre: "Mariana",
            especialidadId: 3,
            descripcion: "Neuróloga especializada en trastornos neurológicos y enfermedades degenerativas. Docente en la Universidad Nacional.",
            obrasocialesId: [2, 3, 4],
            imagen: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
            alt: "Dra. Mariana Rodríguez",
            valorConsulta: 600.00
        },
        {
            id: 4,
            matricula: 456789,
            apellido: "Suárez",
            nombre: "Ernesto",
            especialidadId: 4,
            descripcion: "Dermatólogo con experiencia en dermatología clínica y quirúrgica. Especializado en tratamientos estéticos.",
            obrasocialesId: [1, 3],
            imagen: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ernesto",
            alt: "Dr. Ernesto Suárez",
            valorConsulta: 450.00
        }
    ]
};

const especialidadesData = {
    especialidades: [
        { id: 1, nombre: "Cardiología" },
        { id: 2, nombre: "Pediatría" },
        { id: 3, nombre: "Neurología" },
        { id: 4, nombre: "Dermatología" }
    ]
};

const obrassocialesData = {
    obrasSociales: [
        { id: 1, nombre: "OSDE", porcentaje: 80 },
        { id: 2, nombre: "SANCOR", porcentaje: 75 },
        { id: 3, nombre: "OBRA SOCIAL NACIONAL", porcentaje: 70 },
        { id: 4, nombre: "Swiss MEDICAL", porcentaje: 85 }
    ]
};

// Datos de horarios de atención de médicos
const horariosData = {
    horarios: [
        {
            id: 1,
            medicoId: 1,
            dia: "Lunes",
            horaInicio: "09:00",
            horaFin: "12:00",
            duracionTurno: 30
        },
        {
            id: 2,
            medicoId: 1,
            dia: "Lunes",
            horaInicio: "14:00",
            horaFin: "18:00",
            duracionTurno: 30
        },
        {
            id: 3,
            medicoId: 1,
            dia: "Miércoles",
            horaInicio: "09:00",
            horaFin: "12:00",
            duracionTurno: 30
        },
        {
            id: 4,
            medicoId: 1,
            dia: "Viernes",
            horaInicio: "14:00",
            horaFin: "18:00",
            duracionTurno: 30
        },
        {
            id: 5,
            medicoId: 2,
            dia: "Martes",
            horaInicio: "10:00",
            horaFin: "13:00",
            duracionTurno: 20
        },
        {
            id: 6,
            medicoId: 2,
            dia: "Jueves",
            horaInicio: "15:00",
            horaFin: "19:00",
            duracionTurno: 20
        }
    ]
};

// Datos de turnos agendados
const turnosData = {
    turnos: [
        {
            id: 1,
            pacienteId: 101,
            pacienteNombre: "Juan García",
            medicoId: 1,
            horarioId: 1,
            fecha: "2025-11-18",
            hora: "09:00",
            estado: "confirmado",
            fechaAgendado: "2025-11-11T10:30:00"
        },
        {
            id: 2,
            pacienteId: 102,
            pacienteNombre: "María López",
            medicoId: 1,
            horarioId: 1,
            fecha: "2025-11-18",
            hora: "09:30",
            estado: "confirmado",
            fechaAgendado: "2025-11-11T11:00:00"
        }
    ]
};