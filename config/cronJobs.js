const cron = require('node-cron');
const Cliente = require('../models/Cliente')
const Servicio = require('../models/Servicio');
const { deleteOldTurnos } = require('../controllers/TurnosControllers');
const Moto = require('../models/Moto');
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
};

// Agregar al final de config/cronJobs.js, antes del module.exports

const recordatorioTurnosCron = () => {
    // Se ejecuta todos los días a las 12:00 PM
    cron.schedule('*/1 * * * *', async () => {
        try {
            console.log('Iniciando tarea de recordatorios de turnos...');

            // Calcular la fecha de mañana
            const mañana = new Date();
            mañana.setDate(mañana.getDate() + 1);
            const mañanaStr = mañana.toISOString().split('T')[0]; // Formato YYYY-MM-DD

            console.log('Buscando turnos para:', mañanaStr);

            // Buscar turnos para mañana que tengan email y no se les haya enviado recordatorio
            const Turno = require('../models/Turno');
            const { Op } = require('sequelize');
            
            const turnosMañana = await Turno.findAll({
                where: {
                    fecha: {
                        [Op.like]: `${mañanaStr}%`
                    },
                    email: {
                        [Op.ne]: null,
                        [Op.ne]: ''
                    },
                    recordatorioEnviado: false
                }
            });

            console.log(`Se encontraron ${turnosMañana.length} turnos para enviar recordatorio`);

            if (turnosMañana.length === 0) {
                console.log('No hay turnos con email para mañana');
                return;
            }

            // Enviar email a cada cliente - IGUAL QUE LOS OTROS CRON JOBS
            turnosMañana.forEach((turno) => {
                const fechaTurno = new Date(turno.fecha);
                const fechaFormateada = fechaTurno.toLocaleDateString('es-AR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: turno.email,
                    subject: '🔧 Recordatorio de Turno - Taller Tobías',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <h2 style="color: #333; text-align: center;">🏍️ Taller Tobías</h2>
                                <hr style="border: 1px solid #e0e0e0;">
                                
                                <h3 style="color: #d32f2f;">Recordatorio de Turno</h3>
                                
                                <p style="font-size: 16px; color: #555;">Hola <strong>${turno.nombre}</strong>,</p>
                                
                                <p style="font-size: 16px; color: #555;">
                                    Te recordamos que <strong>mañana ${fechaFormateada}</strong> tienes turno en nuestro taller para realizar el siguiente servicio:
                                </p>
                                
                                <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #d32f2f; margin: 20px 0;">
                                    <p style="margin: 5px 0;"><strong>🏍️ Moto:</strong> ${turno.moto}</p>
                                    <p style="margin: 5px 0;"><strong>🔧 Servicio:</strong> ${turno.descripcion}</p>
                                    ${turno.listaRepuestos && turno.listaRepuestos.length > 0 ? 
                                        `<p style="margin: 5px 0;"><strong>📦 Repuestos:</strong> ${turno.listaRepuestos.join(', ')}</p>` 
                                        : ''}
                                </div>
                                
                                <p style="font-size: 16px; color: #555;">
                                    <strong>⚠️ Importante:</strong> Si no puedes asistir, por favor avísanos con anticipación para reprogramar tu turno.
                                </p>
                                
                                <p style="font-size: 16px; color: #555;">
                                    ¡Te esperamos!
                                </p>
                                
                                <hr style="border: 1px solid #e0e0e0; margin-top: 30px;">
                                
                                <p style="font-size: 14px; color: #999; text-align: center;">
                                    Taller Tobías - Servicio de Mecánica de Motos<br>
                                    📧 tallertobias@outlook.com
                                </p>
                            </div>
                        </div>
                    `
                };

                // Enviar el correo - EXACTAMENTE COMO LOS OTROS
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(`Error al enviar recordatorio a ${turno.email}:`, error);
                    } else {
                        console.log(`Recordatorio enviado a ${turno.email}`);
                        
                        // Marcar como enviado
                        turno.recordatorioEnviado = true;
                        turno.save();
                    }
                });
            });

            console.log('Tarea de recordatorios completada');

        } catch (error) {
            console.error('Error en la tarea de recordatorios:', error);
        }
    }, {
        timezone: "America/Argentina/Buenos_Aires"
    });

    console.log('✅ Cron job de recordatorios de turnos programado (12:00 PM diario)');
};

module.exports = { iniciarCronJobs, deudaCronJobs, deleteTurnosCron, recordatorioTurnosCron }