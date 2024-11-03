const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Cliente = require('./Cliente');

const Moto = sequelize.define('Moto', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    marca: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    modelo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    patente: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
    tableName: 'motos',
    timestamps: true
});

// RELACIONAMOS LA MOTO CON EL CLIENTE

Cliente.hasMany( Moto, { foreignKey: 'clienteId' });
Moto.belongsTo(Cliente, { foreignKey: 'clienteId' });

module.exports = Moto;