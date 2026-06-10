// server.js
const express = require('express');
const { connectDB, sequelize } = require('./config/db');
const clienteRouter = require('./routes/api/clienteRouter');
const motoRouter = require('./routes/api/motoRouter');
const servicioRouter = require('./routes/api/servicioRouter');
const registroCompletoRouter = require('./routes/registroCompletoRouter');
const turnoRouter = require('./routes/turnoRouter');
const datosServicioRouter = require('./routes/api/datosServicioRouter');
const cors = require('cors');
const { iniciarCrons } = require('./config/cron');
require('dotenv').config();

// Conectar a la base de datos
connectDB();

const app = express();
app.use(cors());

// Iniciar cron jobs (unificados)
iniciarCrons();

// Middleware para parsear JSON
app.use(express.json());

// RUTAS
app.use('/api', clienteRouter);
app.use('/api', motoRouter);
app.use('/api', servicioRouter);
app.use('/api', datosServicioRouter);
app.use('/', registroCompletoRouter);
app.use('/', turnoRouter);

// Ruta para verificar si el servidor esta en funcionamiento
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente.');
});

const PORT = /*process.env.DB_PORT || */5000;

// Agrega columnas nuevas a datosservicios si aún no existen (migración segura e idempotente)
const migrarColumnasServicio = async () => {
    try {
        const qi = sequelize.getQueryInterface();
        const tabla = await qi.describeTable('datosservicios').catch(() => null);
        if (!tabla) return; // la tabla no existe todavía, sync la crea después

        const { DataTypes } = require('sequelize');
        const str = { type: DataTypes.STRING, allowNull: true, defaultValue: '' };
        const txt = { type: DataTypes.TEXT,   allowNull: true, defaultValue: '' };

        const columnas = [
            ['cambioAceite', str], ['tipoAceite', str], ['cambioFiltroAceite', str], ['marcaFiltroAceite', str],
            ['cambioMangueras', str], ['cambioFiltroNafta', str], ['cambioBombaNafta', str], ['cambioFiltroAire', str],
            ['limpiezaMantenimiento', str], ['cambioReparacion', str], ['cambioCarburador', str],
            ['revisionAsientoValvulas', str], ['reparacionRecambioValvulas', str], ['registroValvulas', str], ['luzValvulas', str],
            ['cambioBujia', str], ['tipoBujia', str], ['juntaEscape', str],
            ['revisionCompresion', str], ['psiCompresion', str],
            ['rectificacionCilindro', str], ['medidaCilindro', str], ['marcaCilindro', str],
            ['cambioDisco', str], ['marcaDiscos', str], ['recambioCanasta', str],
            ['revisionCentrifugo', str], ['recambioCentrifugoSimple', str], ['recambioEmbragueCentrifugo', str],
            ['cambioJuntaTapaEmbrague', str], ['revisionBombaAceite', str], ['recambioBombaAceite', str],
            ['pruebaBateria', str], ['medicionBateria', str],
            ['pruebaSistemaCarga', str], ['cambioRegulador', str], ['cambioBateria', str], ['cambioEstator', str],
            ['encendidoElectrico', str], ['cambioBoton', str], ['cambioRelaySolenoide', str], ['cambioBendix', str],
            ['reparacionBendix', str], ['reparacionArrastreBurro', str],
            ['reparacionProblemaElectrico', str], ['cualProblemaElectrico', str],
            ['pruebaDeLuces', str], ['recambioFocos', str],
            ['pruebaBotones', str], ['recambioBotones', str], ['pruebaBocina', str],
            ['frenoDelantero', str],
            ['recambioPastillasDelantera', str], ['recambioZapatasDelantera', str],
            ['liquidoFrenoDelantero', str], ['bombaFrenoDelantera', str],
            ['calisperFrenoDelantero', str], ['cableFrenoDelantero', str], ['otrosFrenoDelantero', str],
            ['frenoTrasero', str],
            ['recambioPastillasTrasera', str], ['recambioZapatasTrasera', str],
            ['liquidoFrenoTrasero', str], ['bombaFrenoTrasera', str],
            ['calisperFrenoTrasero', str], ['varrillaFrenoTrasero', str], ['otrosFrenoTrasero', str],
            ['recambioTransmisionCompleta', str], ['tipoTransmision', str],
            ['registroLavadoLubricado', str], ['cambioTacosBujesMasa', str],
            ['cambioEjeTrasero', str], ['cambioPortaCorona', str], ['cambioTornillosSeguros', str],
            ['cambioRulemanes', str], ['cualesRulemanes', str],
            ['cambioRetenes', str], ['cualesRetenes', str],
            ['cambioOring', str], ['cualesOring', str],
            ['mantenimientoBarrasVastagos', str], ['cambioLiquidoHidraulico', str],
            ['cambioResortes', str], ['cambioRetenesSuspension', str], ['medidasRetenesSuspension', str],
            ['cambioBolillerosDireccionales', str], ['mantenimientoTraserAmortiguacion', str],
            ['cambioBujesHorquillon', str], ['medidaBujesHorquillon', str], ['cambioEjeHorquillon', str],
            ['cambioBujesMonoshock', str], ['cambioMonoshock', str], ['cambioAmortiguadores', str],
            ['problemaElectricoTablero', str], ['cualProblemaTablero', str],
            ['velocimetro', str], ['cambioRetorno', str], ['cambioCableTablero', str],
            ['otrosTrabajos', txt],
        ];

        for (const [nombre, def] of columnas) {
            if (!tabla[nombre]) {
                await qi.addColumn('datosservicios', nombre, def);
                console.log(`Columna agregada: ${nombre}`);
            }
        }
        console.log('Migración de datosservicios completada');
    } catch (err) {
        console.error('Error en migración de columnas:', err.message);
    }
};

// Agrega/ajusta columnas nuevas en servicios si aún no existen (migración segura e idempotente)
const migrarTablaServicios = async () => {
    try {
        const qi = sequelize.getQueryInterface();
        const tabla = await qi.describeTable('servicios').catch(() => null);
        if (!tabla) return; // la tabla no existe todavía, sync la crea después

        const { DataTypes } = require('sequelize');

        if (!tabla.fechaIngreso) {
            await qi.addColumn('servicios', 'fechaIngreso', { type: DataTypes.STRING, allowNull: true, defaultValue: '' });
            console.log('Columna agregada: fechaIngreso (servicios)');
        }

        if (tabla.fechaEntrega && tabla.fechaEntrega.allowNull === false) {
            await qi.changeColumn('servicios', 'fechaEntrega', { type: DataTypes.DATE, allowNull: true });
            console.log('Columna fechaEntrega ahora permite NULL (servicios)');
        }
    } catch (err) {
        console.error('Error en migración de columnas de servicios:', err.message);
    }
};

// Sincronizar los modelos con la base de datos y luego iniciar el servidor.
sequelize.sync()
  .then(async () => {
    await migrarColumnasServicio();
    await migrarTablaServicios();
    console.log('Base de datos Sincronizada');
    app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
  })
  .catch(err => console.log('Error al sincronizar la base de datos', err));

