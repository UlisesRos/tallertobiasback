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
    email: {
        type: DataTypes.STRING,
        allowNull: true, // Opcional, por si algunos clientes no tienen email
        validate: {
            isEmail: true // Valida que sea un email válido
        }
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
    },
    listaRepuestos: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    recordatorioEnviado: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false // Para evitar enviar el mismo recordatorio dos veces
    }
}, {
    tableName: 'turnos',
    timestamps: true,
});

module.exports = Turno