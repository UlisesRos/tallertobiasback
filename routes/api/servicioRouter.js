const express = require('express');
const { postServicio, getServicios, updateServicio, updateRepuestos, deleteRepuesto, updateMontoManoObra, updateMotoRepuesto } = require('../../controllers/ServiciosControllers');

const router = express.Router()

// Creacion de Rutas

// Nuevo Servicio

router.post('/postservicio', postServicio);

// Ver Servicios
router.get('/getservicios', getServicios)

// Editar servicios
router.put('/updateservicio/:id', updateServicio)

// Editar Monto de Mano de Obra
router.put('/updatemontomanoobra/:id', updateMontoManoObra)

// Editar Monto Repuesto
router.put('/updatemontorepuesto/:id', updateMotoRepuesto)

// Editar repuestos
router.put('/updaterepuestos/:id', updateRepuestos)

// Eliminar repuestos
router.delete('/deleterepuesto/:id/:repuesto', deleteRepuesto)

module.exports = router;