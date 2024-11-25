const express = require('express');
const { postTurno, getTurnos, deleteTurno } = require('../controllers/TurnosControllers');

const router = express.Router()

// Creacion de rutas

// Ruta para creacion de un nuevo turno
router.post('/postturno', postTurno);

// Mostrar todos los turnos
router.get('/getturnos', getTurnos);

router.delete('/turnos/:id', deleteTurno)

module.exports = router;