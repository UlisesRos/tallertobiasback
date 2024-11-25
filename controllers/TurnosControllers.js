const Turno = require('../models/Turno');

// Agregar nuevo turno
const postTurno = async (req, res) => {
    try {
        const turno = await Turno.create(req.body)
        res.status(201).json(turno)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getTurnos = async (req, res) => {
    try {
        const turnos = await Turno.findAll();
        res.json(turnos)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
};

const deleteTurno = async (req, res) => {
    try {
        const { id } = req.params;

        const turno = await Turno.destroy({ where: { id }});

        if(turno){
            res.status(204).json({ success: 'Cliente Eliminado'})
        } else {
            res.status(404).json({ error: 'Cliente no encontrado' })
        }

    } catch (error) {
        res.status(500).json({ error: 'No se pudo eliminar al cliente:', error})
    }
}


module.exports = { postTurno, getTurnos, deleteTurno }