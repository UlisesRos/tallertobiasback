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
    monto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pago: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '0'
    },
    deuda: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '0'
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

// Hook para calcular deuda antes de guardar
Servicio.beforeSave((servicio) => {
    const monto = parseFloat(servicio.monto) || 0; // Convertir monto a número
    const pago = parseFloat(servicio.pago) || 0;   // Convertir pago a número
    servicio.deuda = (monto - pago).toString();    // Calcular deuda y guardar como string
});

module.exports = Servicio