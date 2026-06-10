const Servicio = require('../models/Servicio');

// Agregar un nuevo servicio
const postServicio = async (req, res) => {
    try {
        const { pago, montoManoObra, montoRepuesto } = req.body

        const monto = parseInt(montoManoObra, 10) + parseInt(montoRepuesto, 10)

        const deuda = parseInt(monto, 10) - parseInt(pago, 10) 

        const servicio = await Servicio.create({
            ...req.body,
            deuda,
            monto
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
        // Excluir campos que no se deben editar jamás
        const { descripcion, fechaIngreso, ...datosActualizables } = req.body;

        const servicio = await Servicio.findOne({ where: { clienteId: id }});
        if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });

        const deuda = parseInt(servicio.monto, 10) - datosActualizables.pago;
        await servicio.update({ ...datosActualizables, deuda });
        res.status(200).json(servicio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Editar Monto de mano de obra
const updateMontoManoObra = async (req, res) => {
    try {
        const { id } = req.params;
        const { montoManoObra } = req.body;

        // Obtener el servicio actual
        const servicio = await Servicio.findOne({ where: { clienteId: id }});
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        // Calcular nuevo monto total
        const monto = parseInt(servicio.montoRepuesto, 10) + parseInt(montoManoObra, 10);

        // Actualizar el servicio
        await servicio.update({
            ...req.body,
            monto
        });

        res.status(200).json(servicio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Editar Monto de repuestos
const updateMotoRepuesto = async (req, res) => {
    try {
        const { id } = req.params;
        const { montoRepuesto } = req.body;

        // Obtener el servicio actual
        const servicio = await Servicio.findOne({ where: { clienteId: id }});
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        // Calcular nueva deuda
        const monto = parseInt(servicio.montoManoObra, 10) + parseInt(montoRepuesto, 10);

        // Actualizar el servicio
        await servicio.update({
            ...req.body,
            monto
        });

        res.status(200).json(servicio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Editar Fecha de Entrega
const updateFechaEntrega = async (req, res) => {
    try {
        const { id } = req.params;
        const { fechaEntrega } = req.body;

        const servicio = await Servicio.findOne({ where: { clienteId: id }});
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        await servicio.update({ fechaEntrega: fechaEntrega || null });

        res.status(200).json(servicio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Editar datos del Proximo Servicio (dias, km, observaciones)
const updateProximoServicio = async (req, res) => {
    try {
        const { id } = req.params;
        const { proximoServicio, kmProximoServicio, descripcionProximoServicio } = req.body;

        const servicio = await Servicio.findOne({ where: { clienteId: id }});
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        const datosActualizar = {};
        if (proximoServicio !== undefined) datosActualizar.proximoServicio = proximoServicio;
        if (kmProximoServicio !== undefined) datosActualizar.kmProximoServicio = kmProximoServicio;
        if (descripcionProximoServicio !== undefined) datosActualizar.descripcionProximoServicio = descripcionProximoServicio;

        await servicio.update(datosActualizar);

        res.status(200).json(servicio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


module.exports = { postServicio, getServicios, updateServicio, updateMontoManoObra, updateMotoRepuesto, updateFechaEntrega, updateProximoServicio }