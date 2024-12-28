const express = require('express');
const { postTurno, getTurnos, deleteTurno, updateRepuestos, deleteRepuesto } = require('../controllers/TurnosControllers');

const router = express.Router()

// Creacion de rutas

// Ruta para creacion de un nuevo turno
router.post('/postturno', postTurno);

// Mostrar todos los turnos
router.get('/getturnos', getTurnos);

// Eliminar Turno
router.delete('/turnos/:id', deleteTurno)

// Editar repuestos
router.put('/updaterepuestos/:id', updateRepuestos)

// Eliminar repuestos
router.delete('/deleterepuesto/:id/:repuesto', deleteRepuesto)


module.exports = router;