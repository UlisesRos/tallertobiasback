const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Cliente = require('./Cliente');

const Servicio = sequelize.define('Servicio', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fechaEntrega: {
        type: DataTypes.DATE,
        allowNull: false
    },
    montoManoObra: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    montoRepuesto: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    monto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pago: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    deuda: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    proximoServicio: {
        type: DataTypes.STRING,
        allowNull: true
    },
    descripcionProximoServicio: {   
        type: DataTypes.STRING,
        allowNull: true
    },
    clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cliente,
            key: 'id'
        },
    }
}, {
    tableName: 'servicios',
    timestamps: true,
});

Cliente.hasMany(Servicio, { foreignKey: 'clienteId' });
Servicio.belongsTo(Cliente, { foreignKey: 'clienteId' });

module.exports = Servicio