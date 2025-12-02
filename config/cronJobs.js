const cron = require('node-cron');
const Cliente = require('../models/Cliente');
const Servicio = require('../models/Servicio');
const { deleteOldTurnos } = require('../controllers/TurnosControllers');
const Moto = require('../models/Moto');
const DatosServicio = require('../models/DatosServicio');
const nodemailer = require('nodemailer');
const Sequelize = require('sequelize');
require('dotenv').config()

// Configuracion de nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_USER,   // tu email verificado en Brevo
        pass: process.env.BREVO_PASS,   // tu key SMTP
    },
});
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

                    // HTML seguro con optional chaining
                    const mailOptions = {
                        from: `"Taller Tobías" <${process.env.EMAIL_USER}>`,
                        to: "tallertobias@outlook.com",
                        subject: `🔧 RECORDATORIO DE SERVICIO PARA ${registro.nombre}`,
                        html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                                .header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                                .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
                                .info-box { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #d32f2f; border-radius: 4px; }
                                .section-title { background-color: #333; color: white; padding: 10px; margin: 20px 0 10px 0; border-radius: 4px; }
                                .data-item { padding: 8px; border-bottom: 1px solid #eee; }
                                .label { font-weight: bold; color: #d32f2f; }
                                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                            </style>
                        </head>
                        <body>

                            <div class="header">
                                <h1>🏍️ Taller Tobías</h1>
                                <h2>Recordatorio de Servicio</h2>
                            </div>
                            
                            <div class="content">

                                <div class="info-box">
                                    <h3>📋 Información del Cliente</h3>
                                    <div class="data-item"><span class="label">Cliente:</span> ${registro.nombre}</div>
                                    <div class="data-item"><span class="label">Teléfono:</span> ${registro.telefono}</div>
                                    ${registro.email ? `<div class="data-item"><span class="label">Email:</span> ${registro.email}</div>` : ''}
                                </div>

                                <div class="info-box">
                                    <h3>🏍️ Información de la Moto</h3>
                                    <div class="data-item"><span class="label">Marca:</span> ${registro.Motos?.[0]?.marca || ''}</div>
                                    <div class="data-item"><span class="label">Modelo:</span> ${registro.Motos?.[0]?.modelo || ''}</div>
                                    ${registro.Motos?.[0]?.km ? `<div class="data-item"><span class="label">Kilómetros:</span> ${registro.Motos?.[0]?.km}</div>` : ''}
                                </div>

                                <div class="info-box">
                                    <h3>🔧 Servicio a Realizar</h3>
                                    <div class="data-item">
                                        <span class="label">Descripción:</span> ${servicio.descripcionProximoServicio || 'No especificado'}
                                    </div>
                                    ${servicio.kmProximoServicio ? `<div class="data-item"><span class="label">KM próximo servicio:</span> ${servicio.kmProximoServicio}</div>` : ''}
                                </div>

                                ${
                                    datosServicio.id ? `
                                    <h3 class="section-title">📊 FICHA TÉCNICA DEL ÚLTIMO SERVICIO</h3>

                                    <!-- LUBRICADO -->
                                    ${
                                        datosServicio?.cambioAceiteMotor ||
                                        datosServicio?.tipoAceite ||
                                        datosServicio?.cambioFiltroAceite ||
                                        datosServicio?.cambioFiltroAire ||
                                        datosServicio?.cambioFiltroCombustible ||
                                        datosServicio?.cambioMangueras
                                        ? `
                                        <div class="info-box">
                                            <h4>🛢️ Lubricado y Combustible</h4>
                                            ${datosServicio?.cambioAceiteMotor ? `<div class="data-item"><span class="label">Cambio Aceite Motor:</span> ${datosServicio.cambioAceiteMotor}</div>` : ''}
                                            ${datosServicio?.tipoAceite ? `<div class="data-item"><span class="label">Tipo de Aceite:</span> ${datosServicio.tipoAceite}</div>` : ''}
                                            ${datosServicio?.cambioFiltroAceite ? `<div class="data-item"><span class="label">Filtro de Aceite:</span> ${datosServicio.cambioFiltroAceite}</div>` : ''}
                                            ${datosServicio?.cambioFiltroAire ? `<div class="data-item"><span class="label">Filtro de Aire:</span> ${datosServicio.cambioFiltroAire}</div>` : ''}
                                            ${datosServicio?.cambioFiltroCombustible ? `<div class="data-item"><span class="label">Filtro Combustible:</span> ${datosServicio.cambioFiltroCombustible}</div>` : ''}
                                            ${datosServicio?.cambioMangueras ? `<div class="data-item"><span class="label">Mangueras:</span> ${datosServicio.cambioMangueras}</div>` : ''}
                                        </div>`
                                        : ''
                                    }

                                    <!-- ELECTRICO -->
                                    ${
                                        datosServicio?.diagnosticoBateria ||
                                        datosServicio?.voltajeBateria ||
                                        datosServicio?.revisionRegulador ||
                                        datosServicio?.revisionSistemaLuces ||
                                        datosServicio?.focosEnMalEstado ||
                                        datosServicio?.fichasRecambio ||
                                        datosServicio?.terminalesRecambio ||
                                        datosServicio?.revisionFugas ||
                                        datosServicio?.reparacionCablesDanados
                                        ? `
                                        <div class="info-box">
                                            <h4>⚡ Sistema Eléctrico</h4>
                                            ${datosServicio?.diagnosticoBateria ? `<div class="data-item"><span class="label">Diagnóstico Batería:</span> ${datosServicio.diagnosticoBateria}</div>` : ''}
                                            ${datosServicio?.voltajeBateria ? `<div class="data-item"><span class="label">Voltaje:</span> ${datosServicio.voltajeBateria}</div>` : ''}
                                            ${datosServicio?.revisionRegulador ? `<div class="data-item"><span class="label">Regulador:</span> ${datosServicio.revisionRegulador}</div>` : ''}
                                            ${datosServicio?.revisionSistemaLuces ? `<div class="data-item"><span class="label">Luces:</span> ${datosServicio.revisionSistemaLuces}</div>` : ''}
                                            ${datosServicio?.focosEnMalEstado ? `<div class="data-item"><span class="label">Focos:</span> ${datosServicio.focosEnMalEstado}</div>` : ''}
                                            ${datosServicio?.fichasRecambio ? `<div class="data-item"><span class="label">Fichas:</span> ${datosServicio.fichasRecambio}</div>` : ''}
                                            ${datosServicio?.terminalesRecambio ? `<div class="data-item"><span class="label">Terminales:</span> ${datosServicio.terminalesRecambio}</div>` : ''}
                                            ${datosServicio?.revisionFugas ? `<div class="data-item"><span class="label">Fugas:</span> ${datosServicio.revisionFugas}</div>` : ''}
                                            ${datosServicio?.reparacionCablesDanados ? `<div class="data-item"><span class="label">Cables:</span> ${datosServicio.reparacionCablesDanados}</div>` : ''}
                                        </div>`
                                        : ''
                                    }

                                    <!-- TRANSMISION -->
                                    ${
                                        datosServicio?.cambioTransmision ||
                                        datosServicio?.reduccionCadena ||
                                        datosServicio?.cambioTornillosCorona ||
                                        datosServicio?.cantidadTornillos ||
                                        datosServicio?.cambioTacosMaza ||
                                        datosServicio?.lubricacionLimpieza
                                        ? `
                                        <div class="info-box">
                                            <h4>⚙️ Transmisión</h4>
                                            ${datosServicio?.cambioTransmision ? `<div class="data-item"><span class="label">Transmisión:</span> ${datosServicio.cambioTransmision}</div>` : ''}
                                            ${datosServicio?.reduccionCadena ? `<div class="data-item"><span class="label">Reducción Cadena:</span> ${datosServicio.reduccionCadena}</div>` : ''}
                                            ${datosServicio?.cambioTornillosCorona ? `<div class="data-item"><span class="label">Tornillos Corona:</span> ${datosServicio.cambioTornillosCorona}</div>` : ''}
                                            ${datosServicio?.cantidadTornillos ? `<div class="data-item"><span class="label">Cantidad Tornillos:</span> ${datosServicio.cantidadTornillos}</div>` : ''}
                                            ${datosServicio?.cambioTacosMaza ? `<div class="data-item"><span class="label">Tacos Maza:</span> ${datosServicio.cambioTacosMaza}</div>` : ''}
                                            ${datosServicio?.lubricacionLimpieza ? `<div class="data-item"><span class="label">Lubricación:</span> ${datosServicio.lubricacionLimpieza}</div>` : ''}
                                        </div>`
                                        : ''
                                    }

                                    <!-- FRENOS -->
                                    ${
                                        datosServicio?.mantenimientoZapatas ||
                                        datosServicio?.recambioDelanteras ||
                                        datosServicio?.recambioTraseras ||
                                        datosServicio?.recambioCable ||
                                        datosServicio?.mantenimientoDisco ||
                                        datosServicio?.recambioLiquido
                                        ? `
                                        <div class="info-box">
                                            <h4>🛑 Frenos</h4>
                                            ${datosServicio?.mantenimientoZapatas ? `<div class="data-item"><span class="label">Zapatas:</span> ${datosServicio.mantenimientoZapatas}</div>` : ''}
                                            ${datosServicio?.recambioDelanteras ? `<div class="data-item"><span class="label">Delanteras:</span> ${datosServicio.recambioDelanteras}</div>` : ''}
                                            ${datosServicio?.recambioTraseras ? `<div class="data-item"><span class="label">Traseras:</span> ${datosServicio.recambioTraseras}</div>` : ''}
                                            ${datosServicio?.recambioCable ? `<div class="data-item"><span class="label">Cable:</span> ${datosServicio.recambioCable}</div>` : ''}
                                            ${datosServicio?.mantenimientoDisco ? `<div class="data-item"><span class="label">Disco:</span> ${datosServicio.mantenimientoDisco}</div>` : ''}
                                            ${datosServicio?.recambioLiquido ? `<div class="data-item"><span class="label">Líquido:</span> ${datosServicio.recambioLiquido}</div>` : ''}
                                        </div>`
                                        : ''
                                    }

                                    <!-- OTROS -->
                                    ${datosServicio?.otros ? `
                                    <div class="info-box">
                                        <h4>📝 Otros</h4>
                                        <div class="data-item">${datosServicio.otros}</div>
                                    </div>` : ''}

                                ` : '<p style="color: #666; font-style: italic;">No hay ficha técnica registrada.</p>'}

                            </div>

                            <div class="footer">
                                <p>🔧 Taller Tobías - Servicio de Mecánica</p>
                                <p>📧 tallertobias@outlook.com</p>
                            </div>

                        </body>
                        </html>
                        `
                    };

                    // Enviar correo
                    transporter.sendMail(mailOptions)
                        .then(info => console.log("Correo enviado:", info.response))
                        .catch(err => console.error("Error SMTP:", err));

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

            let cuerpoCorreo = 'Lista de clientes con deuda:\n\n';

            clientesConDeuda.forEach((cliente, index) => {
                cliente.Servicios.forEach(servicio => {
                    cuerpoCorreo += `
                    ${index + 1}. Cliente: ${cliente.nombre}
                    Teléfono: ${cliente.telefono}
                    Deuda: $${servicio.deuda}
                    Moto: ${cliente.Motos?.[0]?.marca || ''} ${cliente.Motos?.[0]?.modelo || ''}
                    -------------------------------------------
                    `;
                });
            });

            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: "tallertobias@outlook.com",
                subject: "Clientes con deuda pendiente",
                text: cuerpoCorreo
            })
                .then(info => console.log("Correo enviado:", info.response))
                .catch(err => console.error("Error SMTP:", err));

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
