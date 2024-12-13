const Servicio = require('../models/Servicio');

// Agregar un nuevo servicio
const postServicio = async (req, res) => {
    try {
        const servicio = await Servicio.create(req.body);
        res.status(201).json(servicio)
    } catch (error) {
        res.status(400).json({ error: error.message})
    }
}

// Ver Servicios
const getServicios = async (req, res) => {
    try {
        const servicios = await Servicio.findAll();
        res.status(201).json(servicios)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = { postServicio, getServicios }