const cron = require('node-cron');
require('dotenv').config();

const { deleteOldTurnos } = require('../controllers/TurnosControllers');

/**
 * Cron para borrar turnos antiguos
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
  deleteTurnosCron();
  console.log('✅ Todos los cron jobs iniciados');
}

module.exports = {
  iniciarCrons
};
