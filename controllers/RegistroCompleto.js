const Cliente = require('../models/Cliente');
const Moto = require('../models/Moto');
const Servicio = require('../models/Servicio');
const DatosServicio = require('../models/DatosServicio');

const registroCompleto = async (req, res) => {
    try {
        // required: true => INNER JOIN: solo devuelve clientes con moto Y servicio,
        // directamente desde SQL (más rápido que filtrar en memoria).
        // IMPORTANTE: este endpoint ya NO borra clientes "incompletos". Hacerlo aquí
        // eliminaba clientes a mitad del registro (cliente creado pero moto/servicio
        // aún sin cargar) y rompía el alta de nuevos registros.
        const registros = await Cliente.findAll({
            include: [
                {
                    model: Moto,
                    required: true
                },
                {
                    model: Servicio,
                    required: true
                }
            ],
            order: [['id', 'DESC']]
        });

        res.json(registros)
    } catch (error) {
        console.error('Error al obtener los registros', error);
        res.status(500).json({ error: 'Error al obtener los registros' })
    }
};

const deleteClienteCompleto = async (req, res) => {
    try {
        const { id } = req.params;

        // Eliminar todos los datos asociados al cliente antes de eliminarlo
        // (la ficha técnica tiene FK hacia clientes: si no se borra primero,
        // la eliminación del cliente falla)
        await DatosServicio.destroy({ where: { clienteId: id }});
        await Servicio.destroy({ where: { clienteId: id }});
        await Moto.destroy({ where: { clienteId: id }});

        const cliente = await Cliente.destroy({ where: { id }});

        if(cliente){
            res.status(204).json({ success: 'Cliente Eliminado'})
        } else {
            res.status(404).json({ error: 'Cliente no encontrado' })
        }
    } catch (error) {
        console.error('Error al eliminar el cliente', error);
        res.status(500).json({ error: 'No se pudo eliminar al cliente' })
    }
}

module.exports = { registroCompleto, deleteClienteCompleto }
