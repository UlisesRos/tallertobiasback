const DatosServicio = require('../models/DatosServicio');

// Crear o actualizar datos del servicio
const crearOActualizarDatosServicio = async (req, res) => {
    try {
        const { clienteId } = req.body;

        // Validar que clienteId exista
        if (!clienteId) {
            return res.status(400).json({ 
                error: 'El clienteId es requerido' 
            });
        }

        console.log('Buscando datos para clienteId:', clienteId); // Debug

        // Buscar si ya existen datos para este cliente específico
        let datosServicio = await DatosServicio.findOne({ 
            where: { clienteId: clienteId } 
        });

        if (datosServicio) {
            // Si existe, actualizar
            console.log('Actualizando datos existentes para cliente:', clienteId);
            await datosServicio.update(req.body);
            res.status(200).json({ 
                message: 'Datos del servicio actualizados correctamente',
                datosServicio 
            });
        } else {
            // Si no existe, crear nuevo
            console.log('Creando nuevos datos para cliente:', clienteId);
            datosServicio = await DatosServicio.create(req.body);
            res.status(201).json({ 
                message: 'Datos del servicio creados correctamente',
                datosServicio 
            });
        }
    } catch (error) {
        console.error('Error al crear/actualizar datos del servicio:', error);
        res.status(400).json({ error: error.message });
    }
};

// Obtener datos del servicio por clienteId
const obtenerDatosServicioPorCliente = async (req, res) => {
    try {
        const { clienteId } = req.params;
        
        const datosServicio = await DatosServicio.findOne({ 
            where: { clienteId } 
        });

        if (!datosServicio) {
            return res.status(404).json({ 
                message: 'No se encontraron datos del servicio para este cliente' 
            });
        }

        res.status(200).json(datosServicio);
    } catch (error) {
        console.error('Error al obtener datos del servicio:', error);
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los datos de servicio
const obtenerTodosDatosServicio = async (req, res) => {
    try {
        const datosServicios = await DatosServicio.findAll();
        res.status(200).json(datosServicios);
    } catch (error) {
        console.error('Error al obtener datos de servicios:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = { 
    crearOActualizarDatosServicio, 
    obtenerDatosServicioPorCliente,
    obtenerTodosDatosServicio
};