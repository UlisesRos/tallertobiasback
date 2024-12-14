const Servicio = require('../models/Servicio');

// Agregar un nuevo servicio
const postServicio = async (req, res) => {
    try {
        const { pago, monto } = req.body

        const deuda = monto - pago 

        const servicio = await Servicio.create({
            ...req.body,
            deuda
        });

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

// Editar servicio
const updateServicio = async (req, res) => {
    try {
        const { id } = req.params;
        const { pago } = req.body;

        // Obtener el servicio actual
        const servicio = await Servicio.findByPk(id);
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        // Calcular nueva deuda
        const deuda = servicio.monto - pago;

        // Actualizar el servicio
        await servicio.update({
            ...req.body,
            deuda
        });

        res.status(200).json(servicio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { postServicio, getServicios, updateServicio }