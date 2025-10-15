const express = require('express');
const { 
    crearOActualizarDatosServicio, 
    obtenerDatosServicioPorCliente,
    obtenerTodosDatosServicio
} = require('../../controllers/DatosServicioController');

const router = express.Router();

// Obtener todos los datos de servicio 
router.get('/datosservicio', obtenerTodosDatosServicio);

// Obtener datos del servicio por clienteId
router.get('/datosservicio/:clienteId', obtenerDatosServicioPorCliente);

// Crear o actualizar datos del servicio
router.post('/datosservicio', crearOActualizarDatosServicio);

module.exports = router;