const express = require('express');
const { connectDB, sequelize } = require('./config/db');
const clienteRouter = require('./routes/api/clienteRouter')
const motoRouter = require('./routes/api/motoRouter')
const servicioRouter = require('./routes/api/servicioRouter')
const registroCompletoRouter = require('./routes/registroCompletoRouter')
const cors = require('cors')
const iniciarCronJobs = require('./config/cronJobs')
require('dotenv').config();

// Conectar a la base de datos
connectDB();

const app = express();
app.use(cors({
    origin: [
        'https://tallertobias.vercel.app/',  // URL de producción en Vercel
        'http://localhost:3000'                           // Para desarrollo local
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],             // Métodos permitidos
    credentials: true                                      // Para enviar cookies si es necesario
}));

// Ejecutando la tarea programada para whatssap
iniciarCronJobs()

// Middleware para parsear JSON
app.use(express.json());

// RUTAS
// Ruta de clientes
app.use('/api', clienteRouter)

// Ruta de motos
app.use('/api', motoRouter)

// Ruta de servicios
app.use('/api', servicioRouter)

// Ruta de registro completo
app.use('/', registroCompletoRouter)

// Ruta para verificar si el servidor esta en funcionamiento
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente.')
});

const PORT = process.env.DB_PORT || 5000;
// Sincronizar los modelos con la base de datos y luego iniciar el servidor.
sequelize.sync({ force: false })
.then(() => {
    console.log('Base de datos Sincronizada');
    app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
})
.catch(err => console.log('Error al sincronzar la base de datos', err));

