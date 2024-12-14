const cron = require('node-cron');
const Cliente = require('../models/Cliente')
const Servicio = require('../models/Servicio');
const Moto = require('../models/Moto')
const nodemailer = require('nodemailer')
require('dotenv').config()

// Configuracion de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const iniciarCronJobs = () => {

    cron.schedule('0 10 * * *', async () => {
        try {
            console.log('Iniciando tarea de actualizacion de proximoServicio');
            const registros = await Cliente.findAll({
                include: [
                    {
                        model: Servicio
                    },
                    {
                        model: Moto
                    }
                ]
            });

            registros.forEach(async (registro) => {

                if(!registro) {
                    console.log('No hay ningun dato para indagar');
                    return
                }

                if(registro.Servicios[0].proximoServicio > 0) {
                    registro.Servicios[0].proximoServicio -= 1;
                    await registro.Servicios[0].save();
                };

                if(parseInt(registro.Servicios[0].proximoServicio, 10) === 0){
                    registro.Servicios[0].proximoServicio = -1

                    // Configurar contenido del mail
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: "tallertobias@outlook.com",
                        subject: `RECORDATORIO DE SERVICIO PARA ${registro.nombre}`,
                        text: `El cliente ${registro.nombre} necesita un proximo servicio.
                        La moto es ${registro.Motos[0].marca} ${registro.Motos[0].modelo}.
                        El servicio que hay que realizarle es el siguiente: ${registro.Servicios[0].descripcionProximoServicio}.
                        Este es el celular del cliente para comunicarte con el: ${registro.telefono}.
                        Muchas Gracias!` 
                    };

                    // Enviar el correo
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error('Error al enviar el correo:', error);
                        } else {
                            console.log(`Correo enviado: ${info.response}`);
                        }
                    });

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