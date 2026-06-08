// routes/cronRoutes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Turno = require('../models/Turno');
const emailService = require('../services/emailService');
require('dotenv').config();

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

        // Enviar emails uno por uno usando API REST de Brevo
        for (const turno of turnosMañana) {
            try {
                console.log(`🚀 Enviando email a ${turno.email}...`);

                await emailService.sendTurnoReminder(turno);

                console.log(`✅ Recordatorio enviado a ${turno.email}`);

                turno.recordatorioEnviado = true;
                await turno.save();

                enviadosExitosos++;

            } catch (error) {
                console.error(`❌ Error al enviar a ${turno.email}:`, error.message || error.error || 'Error desconocido');
                errores.push({ 
                    email: turno.email, 
                    error: error.message || error.error || 'Error desconocido' 
                });
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
