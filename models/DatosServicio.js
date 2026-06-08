const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Cliente = require('./Cliente');

const str = { type: DataTypes.STRING, allowNull: true, defaultValue: '' };
const txt = { type: DataTypes.TEXT, allowNull: true, defaultValue: '' };

const DatosServicio = sequelize.define('DatosServicio', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    // LUBRICADO
    cambioAceite: str, tipoAceite: str, cambioFiltroAceite: str, marcaFiltroAceite: str,

    // CARBURACION
    cambioMangueras: str, cambioFiltroNafta: str, cambioBombaNafta: str, cambioFiltroAire: str,
    limpiezaMantenimiento: str, cambioReparacion: str, cambioCarburador: str,

    // CABEZAL
    revisionAsientoValvulas: str, reparacionRecambioValvulas: str, registroValvulas: str, luzValvulas: str,
    cambioBujia: str, tipoBujia: str, juntaEscape: str,
    revisionCompresion: str, psiCompresion: str,
    rectificacionCilindro: str, medidaCilindro: str, marcaCilindro: str,

    // SISTEMA DE CLUCH
    cambioDisco: str, marcaDiscos: str,
    recambioCanasta: str,
    revisionCentrifugo: str, recambioCentrifugoSimple: str, recambioEmbragueCentrifugo: str,
    cambioJuntaTapaEmbrague: str,
    revisionBombaAceite: str, recambioBombaAceite: str,

    // SISTEMA ELECTRICO
    pruebaBateria: str, medicionBateria: str,
    pruebaSistemaCarga: str, cambioRegulador: str, cambioBateria: str, cambioEstator: str,

    // LUCES Y BOTONES
    encendidoElectrico: str, cambioBoton: str, cambioRelaySolenoide: str, cambioBendix: str,
    reparacionBendix: str, reparacionArrastreBurro: str,
    reparacionProblemaElectrico: str, cualProblemaElectrico: str,
    pruebaDeLuces: str, recambioFocos: str,
    pruebaBotones: str, recambioBotones: str,
    pruebaBocina: str,

    // SISTEMA DE FRENOS
    frenoDelantero: str,
    recambioPastillasDelantera: str, recambioZapatasDelantera: str,
    liquidoFrenoDelantero: str, bombaFrenoDelantera: str,
    calisperFrenoDelantero: str, cableFrenoDelantero: str, otrosFrenoDelantero: str,
    frenoTrasero: str,
    recambioPastillasTrasera: str, recambioZapatasTrasera: str,
    liquidoFrenoTrasero: str, bombaFrenoTrasera: str,
    calisperFrenoTrasero: str, varrillaFrenoTrasero: str, otrosFrenoTrasero: str,

    // SISTEMA DE ARRASTRE
    recambioTransmisionCompleta: str, tipoTransmision: str,
    registroLavadoLubricado: str, cambioTacosBujesMasa: str,
    cambioEjeTrasero: str, cambioPortaCorona: str,
    cambioTornillosSeguros: str,
    cambioRulemanes: str, cualesRulemanes: str,

    // RETENES Y ORING
    cambioRetenes: str, cualesRetenes: str,
    cambioOring: str, cualesOring: str,

    // SISTEMA DE AMORTIGUACION
    mantenimientoBarrasVastagos: str, cambioLiquidoHidraulico: str,
    cambioResortes: str,
    cambioRetenesSuspension: str, medidasRetenesSuspension: str,
    cambioBolillerosDireccionales: str,
    mantenimientoTraserAmortiguacion: str,
    cambioBujesHorquillon: str, medidaBujesHorquillon: str,
    cambioEjeHorquillon: str,
    cambioBujesMonoshock: str, cambioMonoshock: str, cambioAmortiguadores: str,

    // TABLERO
    problemaElectricoTablero: str, cualProblemaTablero: str,
    velocimetro: str, cambioRetorno: str, cambioCableTablero: str,

    // OTROS
    otrosTrabajos: txt,

    clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: Cliente, key: 'id' },
    }
}, {
    tableName: 'datosservicios',
    timestamps: true,
});

Cliente.hasMany(DatosServicio, { foreignKey: 'clienteId' });
DatosServicio.belongsTo(Cliente, { foreignKey: 'clienteId' });

module.exports = DatosServicio;
