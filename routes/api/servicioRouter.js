const express = require('express');
const { postServicio, getServicios, updateServicio } = require('../../controllers/ServiciosControllers');

const router = express.Router()

// Creacion de Rutas

// Nuevo Servicio

router.post('/postservicio', postServicio);

// Ver Servicios
router.get('/getservicios', getServicios)

// Editar servicios
router.put('/updateservicio/:id', updateServicio)

module.exports = router;