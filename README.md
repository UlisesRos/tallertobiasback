# 🏍️ TallerTobi - Backend API

Sistema integral de gestión para talleres mecánicos de motos con gestión de clientes, servicios, turnos y recordatorios automáticos.

## 📋 Descripción

Backend API RESTful desarrollado en Node.js y Express para gestionar un sistema completo de taller mecánico. Incluye gestión de clientes, motos, servicios, turnos, recordatorios automáticos por email y tareas programadas con cron jobs.

## ✨ Características Principales

### 👥 Gestión de Clientes
- CRUD completo de clientes
- Registro de datos personales y de contacto
- Historial de servicios realizados
- Control de pagos y deudas pendientes
- Notificaciones automáticas de deudas

### 🏍️ Gestión de Motos
- Registro completo de vehículos
- Información detallada (marca, modelo, año, kilometraje)
- Asociación con clientes
- Historial de servicios por moto
- Seguimiento de mantenimientos

### 🔧 Gestión de Servicios
- Ficha técnica completa de servicios
- Categorías de servicios:
  - Lubricación y flujo de combustible
  - Sistema eléctrico
  - Transmisión
  - Frenos y discos
- Registro de mano de obra y repuestos
- Cálculo automático de costos
- Programación de próximos servicios
- Recordatorios automáticos

### 📅 Gestión de Turnos
- Sistema de calendario para agendar servicios
- Asociación de turnos con clientes y motos
- Lista de repuestos necesarios por turno
- Estados de turnos (confirmado, pendiente, completado)
- Recordatorios automáticos 24 horas antes

### 💰 Control Financiero
- Registro de montos por mano de obra
- Control de repuestos y sus costos
- Pagos parciales y deudas
- Cálculo de totales
- Filtros por mes, año y estado de pago

### 📧 Notificaciones Automáticas
- Recordatorios de turnos (24 horas antes)
- Notificaciones de clientes con deuda (mensual)
- Alertas de servicios próximos
- Envío de emails con Nodemailer y Resend

### ⏰ Tareas Programadas (Cron Jobs)
- Decremento diario de contadores de días para servicios
- Envío de recordatorios de turnos
- Notificaciones de deudas pendientes
- Limpieza automática de turnos antiguos

## 🛠️ Tecnologías

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MySQL** - Base de datos relacional
- **Sequelize** - ORM para MySQL
- **Node-cron** - Tareas programadas
- **Nodemailer** - Envío de emails
- **Resend** - Servicio de email alternativo
- **Twilio** - Servicios de mensajería (SMS)
- **Socket.io** - Comunicación en tiempo real
- **dotenv** - Variables de entorno
- **CORS** - Configuración de CORS

## 📦 Instalación

### Prerrequisitos

- Node.js (v14 o superior)
- MySQL (v8 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd TallerTobi/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar base de datos MySQL**

Crear una base de datos:
```sql
CREATE DATABASE taller_tobi;
```

4. **Configurar variables de entorno**

Crear un archivo `.env` en la raíz del proyecto:

```env
# Puerto del servidor
PORT=5000

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=taller_tobi
DB_PORT=3306

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion

# Resend (Alternativa)
RESEND_API_KEY=tu_resend_api_key

# Twilio (Opcional - SMS)
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Socket.io
SOCKET_PORT=5001
```

5. **Iniciar el servidor**

Modo desarrollo:
```bash
npm start
```

El servidor estará disponible en `http://localhost:5000`

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   ├── cronJobs.js          # Configuración de tareas programadas
│   ├── cronRoutes.js        # Rutas para activar/desactivar cron jobs
│   └── db.js                # Configuración de Sequelize
├── controllers/
│   ├── ClientesControllers.js      # Controlador de clientes
│   ├── MotosControllers.js         # Controlador de motos
│   ├── ServiciosControllers.js     # Controlador de servicios
│   ├── TurnosControllers.js        # Controlador de turnos
│   ├── DatosServicioController.js  # Controlador de datos de servicio
│   └── RegistroCompleto.js         # Controlador de registros completos
├── models/
│   ├── Cliente.js           # Modelo de Cliente
│   ├── Moto.js              # Modelo de Moto
│   ├── Servicio.js           # Modelo de Servicio
│   ├── Turno.js              # Modelo de Turno
│   └── DatosServicio.js     # Modelo de Datos de Servicio
├── routes/
│   ├── api/
│   │   ├── clienteRouter.js        # Rutas de clientes
│   │   ├── motoRouter.js           # Rutas de motos
│   │   ├── servicioRouter.js       # Rutas de servicios
│   │   └── datosServicioRouter.js  # Rutas de datos de servicio
│   ├── registroCompletoRouter.js   # Rutas de registros completos
│   └── turnoRouter.js              # Rutas de turnos
├── services/
│   └── emailService.js      # Servicio de envío de emails
├── .env                      # Variables de entorno
├── server.js                 # Punto de entrada
└── package.json
```

## 🔌 API Endpoints

### Clientes

- `GET /api/clientes` - Obtener todos los clientes
- `GET /api/clientes/:id` - Obtener cliente por ID
- `POST /api/clientes` - Crear nuevo cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Motos

- `GET /api/motos` - Obtener todas las motos
- `GET /api/motos/:id` - Obtener moto por ID
- `GET /api/motos/cliente/:clienteId` - Obtener motos de un cliente
- `POST /api/motos` - Crear nueva moto
- `PUT /api/motos/:id` - Actualizar moto
- `DELETE /api/motos/:id` - Eliminar moto

### Servicios

- `GET /api/servicios` - Obtener todos los servicios
- `GET /api/servicios/:id` - Obtener servicio por ID
- `POST /api/servicios` - Crear nuevo servicio
- `PUT /api/servicios/:id` - Actualizar servicio
- `DELETE /api/servicios/:id` - Eliminar servicio

### Turnos

- `GET /api/turnos` - Obtener todos los turnos
- `GET /api/turnos/:id` - Obtener turno por ID
- `GET /api/turnos/semana/:fecha` - Obtener turnos de la semana
- `POST /api/turnos` - Crear nuevo turno
- `PUT /api/turnos/:id` - Actualizar turno
- `DELETE /api/turnos/:id` - Eliminar turno

### Datos de Servicio

- `GET /api/datos-servicio` - Obtener todos los datos de servicio
- `GET /api/datos-servicio/:id` - Obtener datos de servicio por ID
- `POST /api/datos-servicio` - Crear nuevos datos de servicio
- `PUT /api/datos-servicio/:id` - Actualizar datos de servicio
- `DELETE /api/datos-servicio/:id` - Eliminar datos de servicio

### Registros Completos

- `GET /api/registro-completo` - Obtener todos los registros completos
- `GET /api/registro-completo/:id` - Obtener registro completo por ID
- `POST /api/registro-completo` - Crear nuevo registro completo

## ⏰ Cron Jobs

El sistema incluye tareas programadas automáticas:

### Tareas Diarias
- **Decremento de contadores**: Reduce el contador de días para próximos servicios
- **Verificación de turnos**: Revisa turnos para enviar recordatorios

### Tareas Mensuales
- **Notificaciones de deuda**: Envía emails a clientes con saldo pendiente

### Tareas de Limpieza
- **Limpieza de turnos**: Elimina turnos antiguos (mayores a 1 mes)

### Control de Cron Jobs
- `GET /api/cron/status` - Ver estado de cron jobs
- `POST /api/cron/start/:jobName` - Iniciar un cron job
- `POST /api/cron/stop/:jobName` - Detener un cron job

## 📧 Sistema de Notificaciones

### Recordatorios de Turnos
- Se envían automáticamente 24 horas antes del turno
- Incluyen información del cliente, moto y servicio

### Notificaciones de Deuda
- Se envían mensualmente a clientes con saldo pendiente
- Incluyen detalle de deudas y servicios pendientes

### Alertas de Servicios
- Notificaciones cuando se acerca la fecha de próximo servicio
- Basadas en días o kilometraje programado

## 📝 Modelos de Datos

### Cliente
```javascript
{
  nombre: String,
  apellido: String,
  email: String,
  telefono: String,
  direccion: String,
  deuda: Number
}
```

### Moto
```javascript
{
  clienteId: Integer,
  marca: String,
  modelo: String,
  año: Integer,
  kilometraje: Number,
  patente: String
}
```

### Servicio
```javascript
{
  nombre: String,
  descripcion: String,
  categoria: String,
  diasProximoServicio: Integer,
  kilometrosProximoServicio: Integer
}
```

### Turno
```javascript
{
  clienteId: Integer,
  motoId: Integer,
  servicioId: Integer,
  fecha: Date,
  hora: String,
  estado: String,
  repuestos: String
}
```

## 🚀 Uso

### Ejemplo de Petición

**Crear Cliente:**
```bash
POST /api/clientes
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "telefono": "+1234567890",
  "direccion": "Calle Principal 123"
}
```

**Crear Turno:**
```bash
POST /api/turnos
Content-Type: application/json

{
  "clienteId": 1,
  "motoId": 1,
  "servicioId": 1,
  "fecha": "2024-12-25",
  "hora": "10:00",
  "repuestos": "Aceite, filtro"
}
```

## 🔒 Seguridad

- Validación de datos de entrada
- Protección contra inyección SQL con Sequelize
- CORS configurado
- Manejo de errores centralizado

## 📄 Licencia

ISC

## 👨‍💻 Autor

Desarrollado por [Ulises Ros](https://ulisesros-desarrolloweb.vercel.app/)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte, envía un email o abre un issue en el repositorio.
