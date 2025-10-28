const cron = require('node-cron');
const Cliente = require('../models/Cliente')
const Servicio = require('../models/Servicio');
const { deleteOldTurnos } = require('../controllers/TurnosControllers');
const Moto = require('../models/Moto')
const nodemailer = require('nodemailer')
const Sequelize = require('sequelize')
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
                        text: `
                        El cliente ${registro.nombre} necesita un proximo servicio.
                        Moto: ${registro.Motos[0].marca} ${registro.Motos[0].modelo}.
                        Descripcion del servicio a realizar: ${registro.Servicios[0].descripcionProximoServicio}.
                        Celular del cliente: ${registro.telefono}.
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

const deudaCronJobs = () => {
    // Programa la tarea para el 1° de cada mes a las 10:00 AM
    cron.schedule('0 10 1 * *', async () => {
        try {
            console.log('Iniciando tarea de notificación de clientes con deuda...');

            // Busca los clientes que tienen servicios con deuda > 0
            const clientesConDeuda = await Cliente.findAll({
                include: [
                    {
                        model: Servicio,
                        where: {
                            deuda: {
                                [Sequelize.Op.gt]: 0 // deuda > 0
                            }
                        }
                    },
                    { model: Moto } // Incluye también la moto si es necesario
                ]
            });

            // Verifica si hay clientes con deuda
            if (clientesConDeuda.length === 0) {
                console.log('No hay clientes con deuda.');
                return;
            }

            let cuerpoCorreo = 'Lista de clientes con deuda:\n\n';
            clientesConDeuda.forEach((cliente, index) => {
                cliente.Servicios.forEach((servicio) => {
                    cuerpoCorreo += `
                    ${index + 1}. Cliente: ${cliente.nombre}
                    Teléfono: ${cliente.telefono}
                    Deuda: $${servicio.deuda}
                    Moto: ${cliente.Motos[0]?.marca || 'Sin datos'} ${cliente.Motos[0]?.modelo || ''}
                    -------------------------------------------
                    `;
                });
            });

            // Configurar contenido del mail
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: "tallertobias@outlook.com", 
                subject: "Clientes con deuda pendiente",
                text: cuerpoCorreo
            };

            // Enviar el correo
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error al enviar el correo:', error);
                } else {
                    console.log(`Correo enviado exitosamente: ${info.response}`);
                }
            });

            console.log('Tarea de notificación completada.');

        } catch (error) {
            console.error('Error en la tarea programada de clientes con deuda:', error);
        }
    });
};

const deleteTurnosCron = async () => {
    cron.schedule('0 11 * * 1', async () => {
        console.log('Ejecutando limpieza semanal de turnos antiguos...');
        try {
            await deleteOldTurnos();
            console.log('Limpieza de turnos completada.');
        } catch (error) {
            console.error('Error en la limpieza de turnos:', error);
        }
    }, {
        timezone: "America/Argentina/Buenos_Aires"
    });
    
    console.log('Cron job programado para limpieza semanal de turnos.');
}




module.exports = { iniciarCronJobs, deudaCronJobs, deleteTurnosCron }