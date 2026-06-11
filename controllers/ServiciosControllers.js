const Servicio = require('../models/Servicio');

// Convierte a entero de forma segura: '' o undefined cuentan como 0.
// Sin esto, un pago vacío generaba NaN y el INSERT fallaba
// ("Incorrect FLOAT value: ''"), impidiendo registrar clientes nuevos.
const toInt = (valor) => {
    const n = parseInt(valor, 10);
    return Number.isNaN(n) ? 0 : n;
};

// Agregar un nuevo servicio
const postServicio = async (req, res) => {
    try {
        const { pago, montoManoObra, montoRepuesto } = req.body

        const monto = toInt(montoManoObra) + toInt(montoRepuesto)
        const deuda = monto - toInt(pago)

        const servicio = await Servicio.create({
            ...req.body,
            pago: toInt(pago),
            fechaEntrega: req.body.fechaEntrega || null,
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

        const deuda = toInt(servicio.monto) - toInt(datosActualizables.pago);
        await servicio.update({ ...datosActualizables, pago: toInt(datosActualizables.pago), deuda });
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

        // Calcular nuevo monto total y la deuda resultante
        const monto = toInt(servicio.montoRepuesto) + toInt(montoManoObra);
        const deuda = monto - toInt(servicio.pago);

        // Actualizar el servicio
        await servicio.update({
            ...req.body,
            monto,
            deuda
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

        // Calcular nuevo monto total y la deuda resultante
        const monto = toInt(servicio.montoManoObra) + toInt(montoRepuesto);
        const deuda = monto - toInt(servicio.pago);

        // Actualizar el servicio
        await servicio.update({
            ...req.body,
            monto,
            deuda
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