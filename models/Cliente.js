const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Cliente = sequelize.define('Cliente', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false, // No puede estar vacio
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'clientes',
    timestamps: true,
});

module.exports = Cliente