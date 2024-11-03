const express = require('express');
const { postCliente, getClientes } = require('../../controllers/ClientesControllers');

const router = express.Router();

// Creacion de rutas

// Ruta de creacion de nuevo cliente
router.post('/postcliente', postCliente);

// Mostrar todos los clientes
router.get('/getclientes', getClientes);

module.exports = router;