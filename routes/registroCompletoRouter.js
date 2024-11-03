const express = require('express')
const { registroCompleto, deleteClienteCompleto } = require('../controllers/RegistroCompleto');

const router = express.Router()

// Mostrar registro completo
router.get('/registrocompleto', registroCompleto);

// Eliminar Cliente Completo
router.delete('/registrocompleto/:id', deleteClienteCompleto)

module.exports = router