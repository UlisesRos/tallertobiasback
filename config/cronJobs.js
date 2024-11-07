const cron = require('node-cron');
const Cliente = require('../models/Cliente')
const twilio = require('twilio');
const Servicio = require('../models/Servicio');
require('dotenv').config()

// Configuracion de Twilio
const accountSid = process.env.TW_ACCOUNTSID
const authToken = process.env.TW_AUTHTOKEN
const client = twilio(accountSid, authToken);

const iniciarCronJobs = () => {

    cron.schedule('* * * * *', async () => {
        try {
            console.log('Iniciando tarea de actualizacion de proximoServicio');
            const registros = await Cliente.findAll({
                include: [
                    {
                        model: Servicio
                    }
                ]
            });

            registros.forEach(async (registro) => {

                if(registro.Servicios[0].proximoServicio > 0) {
                    registro.Servicios[0].proximoServicio -= 1;
                    await registro.Servicios[0].save();
                };

                if(registro.Servicios[0].proximoServicio === 0){
                    registro.Servicios[0].proximoServicio = 'Realizar Proximo Servicio'

                    client.messages.create({
                        from: 'whatsapp:+14155238886',
                        to: 'whatsapp:+5493413632945',
                        template: 'taller_tobias',
                        body: {
                            1: registro.nombre,
                            2: registro.telefono,
                            3: registro.Servicios[0].descripcionProximoServicio,
                        }
                    })
                    .then((message) => console.log(`Mensaje enviado con ID: ${message.sid}`))
                    .catch((error) => console.error('Error al enviar el mensaje:', error))

                    registro.Servicios[0].save()
                }   
            });
            console.log('Tarea de actualizacion completada')
        } catch (error) {
            console.error('Error en la tarea programada:', error)
        }
    })
};

module.exports = iniciarCronJobs