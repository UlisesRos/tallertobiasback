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

// Editar servicio
const putServicios = async (req, res) => {

    try {
        const { id } = req.params;  // id del cliente
        const { pago } = req.body;  // nuevo valor de pago

        // Buscamos el servicio asociado al cliente
        const servicio = await Servicio.findOne({ where: { clienteId: id } });

        if (servicio) {
            // Si el servicio ya existe, actualizamos el pago
            servicio.pago = pago;  // Actualizamos el campo pago
            await servicio.save();  // Guardamos los cambios en la base de datos
            res.status(200).json({ success: 'Pago actualizado correctamente en el servicio' });
        } else {
            // Si no existe el servicio, lo creamos con el pago
            await Servicio.create({
                clienteId: id,  // Asociamos el servicio con el cliente
                pago            // Agregamos el campo pago
            });
            res.status(201).json({ success: 'Servicio y pago creados correctamente' });
        }

    } catch (error) {
        res.status(500).json({ error: 'No se pudo actualizar o crear el pago:', error });
    }
}

module.exports = { postServicio, getServicios, putServicios }