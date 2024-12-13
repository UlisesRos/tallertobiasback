const express = require('express');
const { postServicio, getServicios } = require('../../controllers/ServiciosControllers');

const router = express.Router()

// Creacion de Rutas

// Nuevo Servicio

router.post('/postservicio', postServicio);

// Ver Servicios
router.get('/getservicios', getServicios)

module.exports = router;