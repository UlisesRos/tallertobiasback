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
        const { pago } = req.body;

        // Obtener el servicio actual
        const servicio = await Servicio.findOne({ where: { clienteId: id }});
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        // Calcular nueva deuda
        const deuda = parseInt(servicio.monto, 10) - pago;

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

const updateRepuestos = async (req, res) => {
    try {
        const { id } = req.params; 
        const { repuestos } = req.body; 

        if (!Array.isArray(repuestos)) {
            return res.status(400).json({ error: 'Los repuestos deben ser un array de strings.' });
        }

        // Obtener el servicio actual
        const servicio = await Servicio.findOne({ where: { clienteId: id }});
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        // Asegurarse de que listaRepuestos sea un array (si no existe, inicializarlo como un array vacío)
        servicio.listaRepuestos = servicio.listaRepuestos || [];

        // Evitar repuestos duplicados
        const updatedRepuestos = [...new Set([...servicio.listaRepuestos, ...repuestos])]; 

        // Actualizar la lista de repuestos
        servicio.listaRepuestos = updatedRepuestos;
        await servicio.save();

        res.status(200).json({ message: 'Lista de repuestos actualizada', listaRepuestos: updatedRepuestos });
    } catch (error) {
        console.error('Error al actualizar los repuestos:', error);
        res.status(500).json({ error: 'Error en el servidor al actualizar los repuestos.' });
    }
};

const deleteRepuesto = async (req, res) => {
    try {
        const { id, repuesto } = req.params; // Obtener el id del cliente y el repuesto a eliminar

        // Obtener el servicio del cliente
        const servicio = await Servicio.findOne({ where: { clienteId: id } });
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        // Filtrar el repuesto a eliminar de la lista
        const updatedRepuestos = servicio.listaRepuestos.filter(item => item !== repuesto);

        // Actualizar la lista de repuestos
        servicio.listaRepuestos = updatedRepuestos;
        await servicio.save();

        res.status(200).json({ message: 'Repuesto eliminado correctamente', listaRepuestos: updatedRepuestos });
    } catch (error) {
        console.error('Error al eliminar el repuesto:', error);
        res.status(500).json({ error: 'Error en el servidor al eliminar el repuesto.' });
    }
};



module.exports = { postServicio, getServicios, updateServicio, updateRepuestos, deleteRepuesto, updateMontoManoObra, updateMotoRepuesto }