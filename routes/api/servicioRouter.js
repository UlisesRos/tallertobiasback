const express = require('express');
const { postServicio, getServicios, updateServicio, updateRepuestos, deleteRepuesto } = require('../../controllers/ServiciosControllers');

const router = express.Router()

// Creacion de Rutas

// Nuevo Servicio

router.post('/postservicio', postServicio);

// Ver Servicios
router.get('/getservicios', getServicios)

// Editar servicios
router.put('/updateservicio/:id', updateServicio)

// Editar repuestos
router.put('/updaterepuestos/:id', updateRepuestos)

// Eliminar repuestos
router.delete('/deleterepuesto/:id/:repuesto', deleteRepuesto)

module.exports = router;