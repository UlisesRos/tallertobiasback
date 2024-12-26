const Cliente = require('../models/Cliente');
const Moto = require('../models/Moto');
const Servicio = require('../models/Servicio')

const registroCompleto = async (req,res) => {
    try {
        const registros = await Cliente.findAll({
            include: [
                {
                    model: Moto,
                },
                {
                    model: Servicio
                }
            ]
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

        // Eliminar el Servicio del cliente asociado con el clienteId
        await Servicio.destroy({ where: { clienteId: id }});

        // Eliminar la Moto del cliente asociado con el clienteId
        await Moto.destroy({ where: { clienteId: id }});

        // Finalmente eliminamos al cliente
        const cliente = await Cliente.destroy({ where: { id }});

        if(cliente){
            res.status(204).json({ success: 'Cliente Eliminado'})
        } else {
            res.status(404).json({ error: 'Cliente no encontrado' })
        }
        
        console.log(id)
    } catch (error) {
        res.status(500).json({ error: 'No se pudo eliminar al cliente:', error})
    }
}

module.exports = { registroCompleto, deleteClienteCompleto }