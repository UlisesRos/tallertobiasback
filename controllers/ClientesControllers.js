const Cliente = require('../models/Cliente');

// Agregar un nuevo cliente
const postCliente = async (req, res) => {
    try {
        const cliente = await Cliente.create(req.body);
        res.status(201).json(cliente);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getClientes = async ( req, res ) => {
    try {
        const clientes = await Cliente.findAll();
        res.json(clientes)
    } catch (error) {
        res.status(400).json({ error: error.message})
    }
}

module.exports = { postCliente, getClientes }