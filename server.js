const express = require('express');
const { connectDB, sequelize } = require('./config/db');
const clienteRouter = require('./routes/api/clienteRouter')
const motoRouter = require('./routes/api/motoRouter')
const servicioRouter = require('./routes/api/servicioRouter')
const registroCompletoRouter = require('./routes/registroCompletoRouter')
const turnoRouter = require('./routes/turnoRouter')
const datosServicioRouter = require('./routes/api/datosServicioRouter')
const cors = require('cors')
const {iniciarCronJobs, deudaCronJobs, deleteTurnosCron} = require('./config/cronJobs')
const cronRoutes = require('./config/cronRoutes')
require('dotenv').config();

// Conectar a la base de datos
connectDB();

const app = express();
app.use(cors());

// Ejecutando la tarea programada para los mails
iniciarCronJobs()
deudaCronJobs()
deleteTurnosCron()

// Middleware para parsear JSON
app.use(express.json());

// RUTAS
// Ruta de Recordatirio de turnos
app.use('/api', cronRoutes)

// Ruta de clientes
app.use('/api', clienteRouter)

// Ruta de motos
app.use('/api', motoRouter)

// Ruta de servicios
app.use('/api', servicioRouter)

// Ruta de datos de servicio
app.use('/api', datosServicioRouter)

// Ruta de registro completo
app.use('/', registroCompletoRouter)

// Ruta de turnos
app.use('/', turnoRouter)

// Ruta para verificar si el servidor esta en funcionamiento
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente.')
});

const PORT = process.env.DB_PORT || 5000;
// Sincronizar los modelos con la base de datos y luego iniciar el servidor.
sequelize.sync()
.then(() => {
    console.log('Base de datos Sincronizada');
    app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
})
.catch(err => console.log('Error al sincronzar la base de datos', err));

