const cron = require('node-cron');
const { Op } = require('sequelize');
require('dotenv').config();

const Cliente = require('../models/Cliente');
const Servicio = require('../models/Servicio');
const Moto = require('../models/Moto');
const DatosServicio = require('../models/DatosServicio');
const Turno = require('../models/Turno');
const { deleteOldTurnos } = require('../controllers/TurnosControllers');

const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// From must be a WhatsApp-enabled Twilio number or sandbox number, including prefix "whatsapp:"
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM; // e.g. "whatsapp:+1415..."
const ADMIN_WHATSAPP_TO = process.env.ADMIN_WHATSAPP_TO || formatToWhatsApp(process.env.WORKSHOP_PHONE || '3413632945');

function formatToWhatsApp(rawNumber) {
  if (!rawNumber) return null;
  // keep digits only
  const digits = rawNumber.toString().replace(/\D/g, '');
  // if starts with country code (54) or +54, use it; else assume Argentina local and add +549 prefix
  if (digits.startsWith('54')) {
    return `whatsapp:+${digits}`;
  }
  if (digits.startsWith('9') && digits.length >= 10) {
    // possible mobile already with leading 9 (local mobile convention) - still prepend +54
    return `whatsapp:+54${digits}`;
  }
  // default fallback: argentina mobile format +549{local}
  return `whatsapp:+549${digits}`;
}

function normalizeClientPhone(raw) {
  if (!raw) return null;

  // Dejar solo números
  let digits = raw.toString().replace(/\D/g, '');

  // Quitar ceros al inicio (ej: 0341 -> 341)
  digits = digits.replace(/^0+/, '');

  // Si ya empieza con 54, quitamos el 54 para normalizarlo
  if (digits.startsWith('54')) {
    digits = digits.substring(2);
  }

  // Si empieza con 9 y mide 11 números (ej: 93413632945), le quitamos el 9
  if (digits.startsWith('9') && digits.length > 10) {
    digits = digits.substring(1);
  }

  // Ahora digits debería quedarte como: 3413632945
  // Construimos el formato WhatsApp para Argentina:
  return `whatsapp:+549${digits}`;
}

async function sendWhatsApp(toWhatsApp, body) {
  if (!TWILIO_WHATSAPP_FROM) {
    console.error('TWILIO_WHATSAPP_FROM no está configurado en .env');
    return;
  }
  try {
    const msg = await client.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to: toWhatsApp,
      body
    });
    console.log('WhatsApp enviado:', toWhatsApp, 'sid:', msg.sid);
    return msg;
  } catch (err) {
    console.error('Error enviando WhatsApp a', toWhatsApp, err && err.message);
    throw err;
  }
}

/**
 * CRON: Recordatorio de turnos (día siguiente)
 * - Busca Turno.fecha para mañana (YYYY-MM-DD)
 * - Envía WhatsApp al teléfono del turno (turno.telefono o cliente.telefono)
 * - Marca turno.recordatorioEnviado = true
 */
const recordatorioTurnosCron = () => {
  cron.schedule('0 10 * * *', async () => {
    console.log('🕐 [cron] Recordatorio de turnos (mañana) iniciado');
    try {
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      const mananaISO = manana.toISOString().split('T')[0]; // YYYY-MM-DD

      const turnosMañana = await Turno.findAll({
        where: {
          fecha: { [Op.like]: `${mananaISO}%` },
          recordatorioEnviado: false
        }
      });

      console.log(`🔎 Encontrados ${turnosMañana.length} turnos para ${mananaISO}`);

      for (const turno of turnosMañana) {
        // preferir telefono en el turno, si no buscar telefono en cliente vinculado
        const telefonoRaw = turno.telefono || turno.dataValues?.telefono || null;
        // si no existe en el turno, intentar buscar el cliente por idCliente
        let telefono = telefonoRaw;
        if (!telefono && turno.clienteId) {
          const cliente = await Cliente.findByPk(turno.clienteId, { include: [Moto, Servicio] });
          telefono = cliente?.telefono || null;
        }

        if (!telefono) {
          console.warn('⚠️ Turno sin teléfono, id:', turno.id);
          // marcar como enviado para no repetir? No lo marcamos, para que lo revise admin.
          continue;
        }

        const toWhats = normalizeClientPhone(telefono);
        if (!toWhats) {
          console.warn('⚠️ No se pudo normalizar teléfono:', telefono);
          continue;
        }

        // Formatear fecha legible
        const fechaTurno = new Date(turno.fecha);
        const fechaFormateada = fechaTurno.toLocaleString('es-AR', {
          weekday: 'long', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        const nombre = turno.nombre || 'Cliente';
        const moto = turno.moto || (turno.dataValues?.moto) || '';
        const servicio = turno.descripcion || '';

        const message = `Hola ${nombre}! 👋\nRecordatorio: mañana tenés turno en Taller Tobías.\n\n🛵 ${moto}\n🔧 ${servicio}\n📅 ${fechaFormateada}\n\nSi necesitás reprogramar respondé a este mensaje.\nTaller Tobías – ${process.env.WORKSHOP_PHONE || '3413632945'}`;

        try {
          await sendWhatsApp(toWhats, message);

          // marcar como enviado
          turno.recordatorioEnviado = true;
          await turno.save();
        } catch (err) {
          console.error('Error enviando recordatorio para turno id', turno.id, err && err.message);
        }
      }

      console.log('✅ [cron] Recordatorio de turnos completado');
    } catch (err) {
      console.error('❌ [cron] Error en recordatorio de turnos', err && err.message);
    }
  }, {
    timezone: 'America/Argentina/Cordoba'
  });
};

/**
 * CRON: Actualización de proximoServicio (diario)
 * - Resta 1 día a servicio.proximoServicio
 * - Si llega a 0 -> enviar WhatsApp al cliente
 */
const proximoServicioCron = () => {
  cron.schedule('0 10 * * *', async () => {
    console.log('🕐 [cron] Actualización de "proximoServicio" iniciada');
    try {
      const clientes = await Cliente.findAll({
        include: [
          { model: Servicio },
          { model: Moto },
          { model: DatosServicio }
        ]
      });

      for (const cliente of clientes) {
        if (!cliente || !cliente.Servicios || cliente.Servicios.length === 0) {
          continue;
        }

        const servicio = cliente.Servicios[0];

        if (typeof servicio.proximoServicio === 'number' && servicio.proximoServicio > 0) {
          servicio.proximoServicio = servicio.proximoServicio - 1;
          await servicio.save();
        }

        if (parseInt(servicio.proximoServicio, 10) === 0) {
          servicio.proximoServicio = -1; // marcar enviado
          await servicio.save();

          const telefonoRaw = cliente.telefono;
          const toWhats = telefonoRaw ? normalizeClientPhone(telefonoRaw) : null;
          if (!toWhats) {
            console.warn('⚠️ Cliente sin teléfono para aviso de servicio:', cliente.nombre);
            continue;
          }

          const marca = cliente.Motos?.[0]?.marca || '';
          const modelo = cliente.Motos?.[0]?.modelo || '';
          const km = cliente.Motos?.[0]?.km ? ` (${cliente.Motos[0].km} km)` : '';

          const message = `Hola ${cliente.nombre}! 👋\nTu moto ${marca} ${modelo}${km} llegó al próximo servicio recomendado.\nTe sugerimos coordinar un turno para mantenerla en óptimas condiciones.\n\nTaller Tobías – ${process.env.WORKSHOP_PHONE || '3413632945'}`;

          try {
            await sendWhatsApp(toWhats, message);
          } catch (err) {
            console.error('Error enviando aviso de servicio a', cliente.nombre, err && err.message);
          }
        }
      }

      console.log('✅ [cron] Actualización de proximoServicio completada');
    } catch (err) {
      console.error('❌ [cron] Error en proximoServicioCron', err && err.message);
    }
  }, {
    timezone: 'America/Argentina/Cordoba'
  });
};

/**
 * CRON: Notificación mensual de clientes con deuda (opcional por WhatsApp al admin)
 */
const deudaCron = () => {
  cron.schedule('0 10 1 * *', async () => {
    console.log('🕐 [cron] Notificación de clientes con deuda iniciada');
    try {
      const Sequelize = require('sequelize');
      const clientesConDeuda = await Cliente.findAll({
        include: [
          {
            model: Servicio,
            where: { deuda: { [Sequelize.Op.gt]: 0 } }
          },
          { model: Moto }
        ]
      });

      if (!clientesConDeuda || clientesConDeuda.length === 0) {
        console.log('No hay clientes con deuda.');
        return;
      }

      // Construir mensaje resumido
      let cuerpo = 'Clientes con deuda:\n';
      clientesConDeuda.forEach((cliente, idx) => {
        cliente.Servicios.forEach(servicio => {
          cuerpo += `${idx + 1}) ${cliente.nombre} - $${servicio.deuda} - ${cliente.Motos?.[0]?.marca || ''} ${cliente.Motos?.[0]?.modelo || ''}\n`;
        });
      });

      // enviar al admin (taller)
      const adminTo = ADMIN_WHATSAPP_TO;
      if (adminTo) {
        try {
          await sendWhatsApp(adminTo, cuerpo);
        } catch (err) {
          console.error('Error enviando lista deudas por WhatsApp a admin', err && err.message);
        }
      } else {
        console.warn('ADMIN_WHATSAPP_TO no configurado, no se envió lista deudas.');
      }

      console.log('✅ [cron] Notificación de clientes con deuda completada');
    } catch (err) {
      console.error('❌ [cron] Error en deudaCron', err && err.message);
    }
  }, {
    timezone: 'America/Argentina/Cordoba'
  });
};

/**
 * Cron para borrar turnos antiguos — reusa tu función existente
 */
const deleteTurnosCron = () => {
  cron.schedule('0 11 * * 1', async () => {
    console.log('🧹 [cron] Limpieza semanal de turnos antiguos iniciada');
    try {
      await deleteOldTurnos();
      console.log('✅ Limpieza de turnos completada.');
    } catch (err) {
      console.error('❌ Error en limpieza de turnos:', err && err.message);
    }
  }, {
    timezone: 'America/Argentina/Cordoba'
  });
};

function iniciarCrons() {
  recordatorioTurnosCron();
  proximoServicioCron();
  deudaCron();
  deleteTurnosCron();
  console.log('✅ Todos los cron jobs iniciados');
}

module.exports = {
  iniciarCrons
};
