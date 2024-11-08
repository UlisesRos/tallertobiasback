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