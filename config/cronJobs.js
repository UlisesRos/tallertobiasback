const cron = require('node-cron');
const Cliente = require('../models/Cliente');
const Servicio = require('../models/Servicio');
const { deleteOldTurnos } = require('../controllers/TurnosControllers');
const Moto = require('../models/Moto');
const DatosServicio = require('../models/DatosServicio');
const emailService = require('../services/emailService');
const Sequelize = require('sequelize');
require('dotenv').config()

const iniciarCronJobs = () => {

    cron.schedule('0 7 * * *', async () => {
        try {
            console.log('Iniciando tarea de actualizacion de proximoServicio');
            const registros = await Cliente.findAll({
                include: [
                    { model: Servicio },
                    { model: Moto },
                    { model: DatosServicio }
                ]
            });

            registros.forEach(async (registro) => {

                if (!registro || !registro.Servicios || registro.Servicios.length === 0) {
                    console.log("Cliente sin servicios:", registro?.nombre);
                    return;
                }

                const servicio = registro.Servicios[0];

                // Restar días
                if (servicio.proximoServicio > 0) {
                    servicio.proximoServicio -= 1;
                    await servicio.save();
                }

                // Si llega a 0 → enviar correo
                if (parseInt(servicio.proximoServicio, 10) === 0) {
                    servicio.proximoServicio = -1;

                    console.log(`📊 Cliente para avisar: ${registro.nombre}`);

                    // Obtener datos de servicio técnico
                    let datosServicio = null;

                    if (registro.DatosServicios && registro.DatosServicios.length > 0) {
                        datosServicio = registro.DatosServicios[0];
                    } else if (registro.dataValues?.DatosServicios?.length > 0) {
                        datosServicio = registro.dataValues.DatosServicios[0];
                    }

                    // Siempre tener un objeto para evitar null
                    datosServicio = datosServicio || {};

                    console.log("📋 DatosServicio encontrado:", !!datosServicio.id);

                    // Enviar correo usando API REST de Brevo
                    try {
                        await emailService.sendServiceReminder(registro, servicio, datosServicio);
                        console.log(`✅ Correo de recordatorio enviado para ${registro.nombre}`);
                    } catch (err) {
                        console.error(`❌ Error al enviar correo para ${registro.nombre}:`, err);
                    }

                    await servicio.save();
                }
            });

            console.log('Tarea de actualizacion completada');
        } catch (error) {
            console.error('Error en la tarea programada:', error);
        }
    });
};

const deudaCronJobs = () => {
    cron.schedule('0 10 1 * *', async () => {
        try {
            console.log('Iniciando tarea de notificación de clientes con deuda...');

            const clientesConDeuda = await Cliente.findAll({
                include: [
                    {
                        model: Servicio,
                        where: { deuda: { [Sequelize.Op.gt]: 0 } }
                    },
                    { model: Moto }
                ]
            });

            if (clientesConDeuda.length === 0) {
                console.log('No hay clientes con deuda.');
                return;
            }

            // Enviar correo usando API REST de Brevo
            try {
                await emailService.sendDebtNotification(clientesConDeuda);
                console.log("✅ Correo de deudas enviado exitosamente");
            } catch (err) {
                console.error("❌ Error al enviar correo de deudas:", err);
            }

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

module.exports = { iniciarCronJobs, deudaCronJobs, deleteTurnosCron }
