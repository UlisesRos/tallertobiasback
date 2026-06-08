// server.js
const express = require('express');
const { connectDB, sequelize } = require('./config/db');
const clienteRouter = require('./routes/api/clienteRouter');
const motoRouter = require('./routes/api/motoRouter');
const servicioRouter = require('./routes/api/servicioRouter');
const registroCompletoRouter = require('./routes/registroCompletoRouter');
const turnoRouter = require('./routes/turnoRouter');
const datosServicioRouter = require('./routes/api/datosServicioRouter');
const cors = require('cors');
const { iniciarCrons } = require('./config/cron');
require('dotenv').config();

// Conectar a la base de datos
connectDB();

const app = express();
app.use(cors());

// Iniciar cron jobs (unificados)
iniciarCrons();

// Middleware para parsear JSON
app.use(express.json());

// RUTAS
app.use('/api', clienteRouter);
app.use('/api', motoRouter);
app.use('/api', servicioRouter);
app.use('/api', datosServicioRouter);
app.use('/', registroCompletoRouter);
app.use('/', turnoRouter);

// Ruta para verificar si el servidor esta en funcionamiento
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente.');
});

const PORT =process.env.DB_PORT || 5000;
// Sincronizar los modelos con la base de datos y luego iniciar el servidor.
sequelize.sync()
  .then(() => {
    console.log('Base de datos Sincronizada');
    app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
  })
  .catch(err => console.log('Error al sincronizar la base de datos', err));

