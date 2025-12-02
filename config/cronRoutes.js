// routes/cronRoutes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Turno = require('../models/Turno');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_USER,   // tu email verificado en Brevo
        pass: process.env.BREVO_PASS,   // tu key SMTP
    },
});

// Ruta para enviar recordatorios de turnos
router.get('/recordatorios-turnos', async (req, res) => {
    try {
        console.log('🕐 Iniciando tarea de recordatorios de turnos...');

        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 1);
        const mañanaStr = mañana.toISOString().split('T')[0];

        console.log('📅 Buscando turnos para:', mañanaStr);

        const turnosMañana = await Turno.findAll({
            where: {
                fecha: { [Op.like]: `${mañanaStr}%` },
                email: { [Op.ne]: null, [Op.ne]: '' },
                recordatorioEnviado: false
            }
        });

        console.log(`📊 Se encontraron ${turnosMañana.length} turnos para enviar recordatorio`);

        if (turnosMañana.length === 0) {
            return res.json({ 
                success: true, 
                message: 'No hay turnos con email para mañana',
                enviados: 0
            });
        }

        let enviadosExitosos = 0;
        let errores = [];

        // Enviar emails uno por uno
        for (const turno of turnosMañana) {
            const fechaTurno = new Date(turno.fecha);
            const fechaFormateada = fechaTurno.toLocaleDateString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            try {
                console.log(`🚀 Enviando email a ${turno.email}...`);

                const mailOptions = {
                    from: `"Taller Tobías" <${process.env.EMAIL_USER}>`,
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
                                Te recordamos que <strong>mañana ${fechaFormateada}</strong> tienes un turno en nuestro taller para realizar el siguiente servicio:
                            </p>
                            
                            <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #d32f2f; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>🏍️ Moto:</strong> ${turno.moto}</p>
                                <p style="margin: 5px 0;"><strong>🔧 Servicio:</strong> ${turno.descripcion}</p>
                                ${
                                    turno.listaRepuestos && turno.listaRepuestos.length > 0
                                    ? `<p style="margin: 5px 0;"><strong>📦 Repuestos:</strong> ${turno.listaRepuestos.join(', ')}</p>`
                                    : ''
                                }
                            </div>
                            
                            <p style="font-size: 16px; color: #555;">
                                <strong>⚠️ Importante:</strong> Si no puedes asistir, por favor avísanos con anticipación para reprogramar tu turno.
                            </p>
                            
                            <p style="font-size: 16px; color: #555;">¡Te esperamos!</p>
                            
                            <hr style="border: 1px solid #e0e0e0; margin-top: 30px;">
                            
                            <p style="font-size: 14px; color: #999; text-align: center;">
                                Taller Tobías - Servicio de Mecánica de Motos<br>
                                📧 tallertobias@outlook.com
                            </p>
                        </div>
                    </div>
                    `
                };

                await transporter.sendMail(mailOptions);

                console.log(`✅ Recordatorio enviado a ${turno.email}`);

                turno.recordatorioEnviado = true;
                await turno.save();

                enviadosExitosos++;

            } catch (error) {
                console.error(`❌ Error al enviar a ${turno.email}:`, error.message);
                errores.push({ email: turno.email, error: error.message });
            }
        }

        console.log('✅ Tarea de recordatorios completada');

        return res.json({
            success: true,
            message: 'Tarea de recordatorios completada',
            turnosEncontrados: turnosMañana.length,
            enviadosExitosos,
            errores: errores.length > 0 ? errores : undefined
        });

    } catch (error) {
        console.error('❌ Error en la tarea de recordatorios:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar recordatorios',
            error: error.message
        });
    }
});

// Ruta de health check
router.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Cron endpoint activo',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
