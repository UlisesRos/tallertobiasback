const Moto = require('../models/Moto');

// Agregar una nueva moto
const postMoto = async (req, res) => {
    try {
        const moto = await Moto.create(req.body);
        res.status(201).json(moto);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
};

const getMotos = async ( req, res ) => {
    try {
        const motos = await Moto.findAll()
        res.status(201).json(motos)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = { postMoto, getMotos }