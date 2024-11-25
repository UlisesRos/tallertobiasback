const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Turno = sequelize.define('Turno', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false, // No puede estar vacio
    },
    moto: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fecha: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'turnos',
    timestamps: true,
});

module.exports = Turno