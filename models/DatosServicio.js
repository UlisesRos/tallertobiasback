// Archivo: backend/models/DatosServicio.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Cliente = require('./Cliente');

const DatosServicio = sequelize.define('DatosServicio', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // LUBRICADO Y FLUJO DE COMBUSTIBLE
    cambioAceiteMotor: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    tipoAceite: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    cambioFiltroAceite: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    cambioFiltroAire: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    cambioFiltroCombustible: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    cambioMangueras: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    
    // SISTEMA ELECTRICO
    diagnosticoBateria: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    voltajeBateria: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    revisionRegulador: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    revisionSistemaLuces: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    focosEnMalEstado: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    fichasRecambio: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    terminalesRecambio: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    revisionFugas: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    reparacionCablesDanados: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    
    // TRANSMISION
    cambioTransmision: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    reduccionCadena: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    cambioTornillosCorona: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    cantidadTornillos: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    cambioTacosMaza: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    lubricacionLimpieza: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    
    // FRENOS
    mantenimientoZapatas: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    recambioDelanteras: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    recambioTraseras: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    recambioCable: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    otros: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
    },
    
    // MANTENIMIENTO DE DISCO
    mantenimientoDisco: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    recambioLiquido: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    
    clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // Esto asegura que solo haya un registro por cliente
        references: {
            model: Cliente,
            key: 'id'
        },
    }
}, {
    tableName: 'datosservicios',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['clienteId']
        }
    ]
});

Cliente.hasMany(DatosServicio, { foreignKey: 'clienteId' });
DatosServicio.belongsTo(Cliente, { foreignKey: 'clienteId' });

module.exports = DatosServicio;