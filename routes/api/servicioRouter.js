const express = require('express');
const { postServicio, getServicios, putServicios } = require('../../controllers/ServiciosControllers');

const router = express.Router()

// Creacion de Rutas

// Nuevo Servicio
router.post('/postservicio', postServicio);

// Ver Servicios
router.get('/getservicios', getServicios)

// Editar Servicios
router.put('/putservicios/:id', putServicios);

module.exports = router;