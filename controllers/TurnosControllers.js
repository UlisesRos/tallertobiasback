const Turno = require('../models/Turno');
const { Op } = require('sequelize');

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

const deleteOldTurnos = async () => {
    try {
        // Calcular la fecha límite (2 semanas atrás desde hoy)
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        // Eliminar turnos cuya fecha sea anterior a twoWeeksAgo
        const result = await Turno.destroy({
            where: {
                fecha: {
                    [Op.lt]: twoWeeksAgo // Op.lt significa "less than" (menor que)
                }
            }
        });
        
        console.log(`Se eliminaron ${result} turnos antiguos.`);
        return result;
    } catch (error) {
        console.error('Error al eliminar turnos antiguos:', error);
        throw error;
    }
};

const updateRepuestos = async (req, res) => {
    try {
        const { id } = req.params; 
        const { repuestos } = req.body; 

        if (!Array.isArray(repuestos)) {
            return res.status(400).json({ error: 'Los repuestos deben ser un array de strings.' });
        }

        // Obtener el turno actual
        const turno = await Turno.findOne({ where: { id: id }});
        if (!turno) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        // Asegurarse de que listaRepuestos sea un array (si no existe, inicializarlo como un array vacío)
        turno.listaRepuestos = turno.listaRepuestos || [];

        // Evitar repuestos duplicados
        const updatedRepuestos = [...new Set([...turno.listaRepuestos, ...repuestos])]; 

        // Actualizar la lista de repuestos
        turno.listaRepuestos = updatedRepuestos;
        await turno.save();

        res.status(200).json({ message: 'Lista de repuestos actualizada', listaRepuestos: updatedRepuestos });
    } catch (error) {
        console.error('Error al actualizar los repuestos:', error);
        res.status(500).json({ error: 'Error en el servidor al actualizar los repuestos.' });
    }
};

const deleteRepuesto = async (req, res) => {
    try {
        const { id, repuesto } = req.params; // Obtener el id del cliente y el repuesto a eliminar

        // Obtener el turno del cliente
        const turno = await Turno.findOne({ where: { id: id } });
        if (!turno) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        // Filtrar el repuesto a eliminar de la lista
        const updatedRepuestos = turno.listaRepuestos.filter(item => item !== repuesto);

        // Actualizar la lista de repuestos
        turno.listaRepuestos = updatedRepuestos;
        await turno.save();

        res.status(200).json({ message: 'Repuesto eliminado correctamente', listaRepuestos: updatedRepuestos });
    } catch (error) {
        console.error('Error al eliminar el repuesto:', error);
        res.status(500).json({ error: 'Error en el servidor al eliminar el repuesto.' });
    }
};


module.exports = { postTurno, getTurnos, deleteTurno, updateRepuestos, deleteRepuesto, deleteOldTurnos }