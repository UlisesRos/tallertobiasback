const express = require('express');
const { postMoto, getMotos } = require('../../controllers/MotosControllers');

const router = express.Router()

// Creacion de Rutas

// Nueva Moto
router.post('/postmoto', postMoto);

// Ver todas las motos
router.get('/getmotos', getMotos)

module.exports = router;