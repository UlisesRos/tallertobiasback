# Migración de Brevo SMTP a API REST

Este documento describe la migración del sistema de envío de emails de Brevo SMTP (usando nodemailer) a la API REST de Brevo.

## Cambios Realizados

### 1. Nuevo Servicio de Email
Se creó el archivo `services/emailService.js` que utiliza la API REST de Brevo en lugar de SMTP.

### 2. Archivos Actualizados
- `config/cronJobs.js` - Actualizado para usar el nuevo servicio de email
- `config/cronRoutes.js` - Actualizado para usar el nuevo servicio de email

### 3. Dependencias
- Se mantiene `axios` (ya estaba instalado) para las peticiones HTTP
- Se puede eliminar `nodemailer` si no se usa en otra parte del proyecto

## Variables de Entorno Requeridas

Asegúrate de tener las siguientes variables en tu archivo `.env`:

```env
# API Key de Brevo (obligatoria)
# Obtén tu API Key desde: https://app.brevo.com/settings/keys/api
BREVO_API_KEY=tu_api_key_aqui

# Email del remitente (obligatorio)
# Debe ser un email verificado en tu cuenta de Brevo
EMAIL_USER=tallertobias@outlook.com

# Opcional: Si ya tenías BREVO_PASS configurada, el servicio la usará como fallback
# pero es recomendable usar BREVO_API_KEY directamente
BREVO_PASS=tu_api_key_aqui  # (opcional, solo como fallback)
```

## Cómo Obtener tu API Key de Brevo

1. Inicia sesión en tu cuenta de Brevo: https://app.brevo.com
2. Ve a **Settings** → **API Keys**
3. Crea una nueva API Key o usa una existente
4. Copia la API Key y agrégala a tu archivo `.env` como `BREVO_API_KEY`

## Diferencias entre SMTP y API REST

### SMTP (Anterior)
- Usaba `nodemailer` con configuración SMTP
- Requería `BREVO_USER` y `BREVO_PASS` (SMTP credentials)
- Conexión directa al servidor SMTP

### API REST (Nuevo)
- Usa `axios` para peticiones HTTP
- Requiere solo `BREVO_API_KEY`
- Más confiable y con mejor manejo de errores
- Mejor para aplicaciones en producción

## Funcionalidades del Servicio de Email

El servicio `emailService.js` incluye los siguientes métodos:

1. **`sendEmail(options)`** - Método genérico para enviar cualquier email
2. **`sendServiceReminder(registro, servicio, datosServicio)`** - Envía recordatorio de servicio
3. **`sendTurnoReminder(turno)`** - Envía recordatorio de turno
4. **`sendDebtNotification(clientesConDeuda)`** - Envía notificación de deudas

## CronJobs Configurados

Los siguientes cronJobs están configurados y funcionan con la nueva API:

1. **Recordatorio de Servicios** - Se ejecuta diariamente a las 7:00 AM
   - Envía emails cuando `proximoServicio` llega a 0

2. **Notificación de Deudas** - Se ejecuta el día 1 de cada mes a las 10:00 AM
   - Envía lista de clientes con deuda pendiente

3. **Limpieza de Turnos** - Se ejecuta los lunes a las 11:00 AM
   - Elimina turnos antiguos (no envía emails)

4. **Recordatorios de Turnos** - Disponible como ruta API
   - Ruta: `GET /api/recordatorios-turnos`
   - Envía recordatorios 24 horas antes de cada turno

## Pruebas

Para probar el servicio de email, puedes:

1. Ejecutar manualmente la ruta de recordatorios:
   ```bash
   curl http://localhost:5000/api/recordatorios-turnos
   ```

2. Verificar los logs del servidor para confirmar que los emails se envían correctamente

3. Revisar la consola de Brevo para ver el estado de los emails enviados

## Solución de Problemas

### Error: "BREVO_API_KEY no configurada"
- Verifica que la variable `BREVO_API_KEY` esté en tu archivo `.env`
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto `backend/`

### Error: "Invalid API Key"
- Verifica que la API Key sea correcta
- Asegúrate de que la API Key tenga permisos para enviar emails transaccionales

### Error: "Sender email not verified"
- El email en `EMAIL_USER` debe estar verificado en tu cuenta de Brevo
- Ve a **Settings** → **Senders** en Brevo y verifica tu email

## Notas Adicionales

- El servicio mantiene compatibilidad con `BREVO_PASS` como fallback, pero se recomienda usar `BREVO_API_KEY`
- Todos los emails se envían desde el email configurado en `EMAIL_USER`
- El nombre del remitente es "Taller Tobías" por defecto

