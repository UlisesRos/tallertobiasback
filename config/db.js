const { Sequelize } = require('sequelize');

// Traemos las variables de entorno
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        timezone: '-03:00'
    }
);

const connectDB = async() => {
    try {
        await sequelize.authenticate();
        console.log('MYSQL conectado');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos', error)
    }
};

module.exports = { sequelize, connectDB }