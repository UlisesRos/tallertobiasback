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

    cron.schedule('0 10 * * *', async () => {
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

                    console.log(registro.Servicios[0].descripcionProximoServicio)

                    client.messages.create({
                        from: 'whatsapp:+14155238886',
                        to: 'whatsapp:+5493413632945',
                        body: `El cliente ${registro.nombre} necesita un nuevo Servicio. Servicio a realizar: ${registro.Servicios[0].descripcionProximoServicio}. Comunicate a su Celular para contactar con el: ${registro.telefono}`
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