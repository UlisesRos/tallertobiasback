const axios = require('axios');
require('dotenv').config();

/**
 * Servicio de email usando la API REST de Brevo
 * Reemplaza el uso de nodemailer con SMTP
 */
class EmailService {
    constructor() {
        this.apiKey = process.env.BREVO_API_KEY || process.env.BREVO_PASS;
        this.senderEmail = process.env.EMAIL_USER;
        this.senderName = 'Taller Tobías';
        this.baseURL = 'https://api.brevo.com/v3';
        
        if (!this.apiKey) {
            console.warn('⚠️ BREVO_API_KEY no configurada. Los emails no se enviarán.');
        }
    }

    /**
     * Envía un email usando la API REST de Brevo
     * @param {Object} options - Opciones del email
     * @param {string|Array} options.to - Email(s) destinatario(s)
     * @param {string} options.subject - Asunto del email
     * @param {string} options.html - Contenido HTML del email
     * @param {string} [options.text] - Contenido de texto plano (opcional)
     * @param {string} [options.from] - Email remitente (opcional, usa el configurado por defecto)
     * @param {string} [options.fromName] - Nombre del remitente (opcional)
     * @returns {Promise<Object>} Respuesta de la API de Brevo
     */
    async sendEmail({ to, subject, html, text, from, fromName }) {
        if (!this.apiKey) {
            throw new Error('BREVO_API_KEY no configurada. No se puede enviar el email.');
        }

        // Normalizar el destinatario (puede ser string o array)
        const toArray = Array.isArray(to) ? to : [to];
        
        // Preparar el payload según la API de Brevo
        const payload = {
            sender: {
                email: from || this.senderEmail,
                name: fromName || this.senderName
            },
            to: toArray.map(email => ({ email })),
            subject: subject,
            htmlContent: html,
        };

        // Agregar contenido de texto si se proporciona
        if (text) {
            payload.textContent = text;
        }

        try {
            const response = await axios.post(
                `${this.baseURL}/smtp/email`,
                payload,
                {
                    headers: {
                        'api-key': this.apiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            console.log('✅ Email enviado exitosamente:', response.data);
            return {
                success: true,
                messageId: response.data.messageId,
                data: response.data
            };
        } catch (error) {
            console.error('❌ Error al enviar email con Brevo API:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            throw {
                success: false,
                error: error.message,
                details: error.response?.data || 'Error desconocido'
            };
        }
    }

    /**
     * Envía un email de recordatorio de servicio
     * @param {Object} registro - Datos del registro/cliente
     * @param {Object} servicio - Datos del servicio
     * @param {Object} datosServicio - Datos técnicos del servicio
     * @returns {Promise<Object>}
     */
    async sendServiceReminder(registro, servicio, datosServicio = {}) {
        const html = this.generateServiceReminderHTML(registro, servicio, datosServicio);
        
        return await this.sendEmail({
            to: 'tallertobias@outlook.com',
            subject: `🔧 RECORDATORIO DE SERVICIO PARA ${registro.nombre}`,
            html: html
        });
    }

    /**
     * Envía un email de recordatorio de turno
     * @param {Object} turno - Datos del turno
     * @returns {Promise<Object>}
     */
    async sendTurnoReminder(turno) {
        const fechaTurno = new Date(turno.fecha);
        const fechaFormateada = fechaTurno.toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #333; text-align: center;">🏍️ Taller Tobías</h2>
                <hr style="border: 1px solid #e0e0e0;">

                <h3 style="color: #d32f2f;">Recordatorio de Turno</h3>

                <p style="font-size: 16px; color: #555;">Hola <strong>${turno.nombre}</strong>,</p>

                <p style="font-size: 16px; color: #555;">
                    Te recordamos que <strong>mañana ${fechaFormateada}</strong> tienes un turno en nuestro taller para realizar el siguiente servicio:
                </p>

                <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #d32f2f; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>🏍️ Moto:</strong> ${turno.moto}</p>
                    <p style="margin: 5px 0;"><strong>🔧 Servicio:</strong> ${turno.descripcion}</p>
                    ${turno.horario ? `<p style="margin: 5px 0;"><strong>🕐 Horario:</strong> ${turno.horario} hs</p>` : ''}
                    ${
                        turno.listaRepuestos && turno.listaRepuestos.length > 0
                        ? `<p style="margin: 5px 0;"><strong>📦 Repuestos:</strong> ${turno.listaRepuestos.join(', ')}</p>`
                        : ''
                    }
                </div>

                <p style="font-size: 16px; color: #555;">
                    <strong>⚠️ Importante:</strong> Si no puedes asistir, por favor avísanos con anticipación para reprogramar tu turno.
                </p>

                <p style="font-size: 16px; color: #555;">¡Te esperamos!</p>

                <hr style="border: 1px solid #e0e0e0; margin-top: 30px;">

                <p style="font-size: 14px; color: #999; text-align: center;">
                    Taller Tobías - Servicio de Mecánica de Motos<br>
                    📧 tallertobias@outlook.com
                </p>
            </div>
        </div>
        `;

        return await this.sendEmail({
            to: turno.email,
            subject: '🔧 Recordatorio de Turno - Taller Tobías',
            html: html
        });
    }

    /**
     * Envía un email de notificación de clientes con deuda
     * @param {Array} clientesConDeuda - Array de clientes con deuda
     * @returns {Promise<Object>}
     */
    async sendDebtNotification(clientesConDeuda) {
        let cuerpoCorreo = 'Lista de clientes con deuda:\n\n';

        clientesConDeuda.forEach((cliente, index) => {
            cliente.Servicios.forEach(servicio => {
                cuerpoCorreo += `
                ${index + 1}. Cliente: ${cliente.nombre}
                Teléfono: ${cliente.telefono}
                Deuda: $${servicio.deuda}
                Moto: ${cliente.Motos?.[0]?.marca || ''} ${cliente.Motos?.[0]?.modelo || ''}
                -------------------------------------------
                `;
            });
        });

        return await this.sendEmail({
            to: 'tallertobias@outlook.com',
            subject: 'Clientes con deuda pendiente',
            text: cuerpoCorreo
        });
    }

    /**
     * Genera el HTML para el recordatorio de servicio
     * @private
     */
    generateServiceReminderHTML(registro, servicio, datosServicio) {
        const d = datosServicio || {};

        const row = (label, value) =>
            value && value.toString().trim()
                ? `<div class="data-item"><span class="label">${label}:</span> ${value}</div>`
                : '';

        const section = (icon, title, rows) => {
            const content = rows.filter(Boolean).join('');
            return content
                ? `<div class="info-box"><h4>${icon} ${title}</h4>${content}</div>`
                : '';
        };

        const fichaHTML = d.id ? `
            <h3 class="section-title">📊 FICHA TÉCNICA DEL ÚLTIMO SERVICIO</h3>

            ${section('🛢️', 'Lubricado', [
                row('Cambio aceite', d.cambioAceite),
                row('Tipo aceite', d.tipoAceite),
                row('Cambio filtro aceite', d.cambioFiltroAceite),
                row('Marca filtro aceite', d.marcaFiltroAceite),
            ])}

            ${section('⛽', 'Carburación', [
                row('Cambio mangueras', d.cambioMangueras),
                row('Cambio filtro nafta', d.cambioFiltroNafta),
                row('Cambio bomba nafta', d.cambioBombaNafta),
                row('Cambio filtro aire', d.cambioFiltroAire),
                row('Limpieza y mantenimiento', d.limpiezaMantenimiento),
                row('Cambio reparación', d.cambioReparacion),
                row('Cambio carburador', d.cambioCarburador),
            ])}

            ${section('🔩', 'Cabezal', [
                row('Revisión asiento válvulas', d.revisionAsientoValvulas),
                row('Reparación/recambio válvulas', d.reparacionRecambioValvulas),
                row('Registro válvulas', d.registroValvulas),
                row('Luz válvulas', d.luzValvulas),
                row('Cambio bujía', d.cambioBujia),
                row('Tipo bujía', d.tipoBujia),
                row('Junta escape', d.juntaEscape),
                row('Revisión compresión', d.revisionCompresion),
                row('PSI compresión', d.psiCompresion),
                row('Rectificación cilindro', d.rectificacionCilindro),
                row('Medida cilindro', d.medidaCilindro),
                row('Marca cilindro', d.marcaCilindro),
            ])}

            ${section('⚙️', 'Sistema de Clutch', [
                row('Cambio discos', d.cambioDisco),
                row('Marca discos', d.marcaDiscos),
                row('Recambio canasta', d.recambioCanasta),
                row('Revisión centrífugo', d.revisionCentrifugo),
                row('Recambio centrífugo simple', d.recambioCentrifugoSimple),
                row('Recambio embrague con centrífugo', d.recambioEmbragueCentrifugo),
                row('Cambio junta tapa embrague', d.cambioJuntaTapaEmbrague),
                row('Revisión bomba aceite', d.revisionBombaAceite),
                row('Recambio bomba aceite', d.recambioBombaAceite),
            ])}

            ${section('⚡', 'Sistema Eléctrico', [
                row('Prueba batería', d.pruebaBateria),
                row('Medición batería', d.medicionBateria),
                row('Prueba sistema carga', d.pruebaSistemaCarga),
                row('Cambio regulador', d.cambioRegulador),
                row('Cambio batería', d.cambioBateria),
                row('Cambio estátor', d.cambioEstator),
            ])}

            ${section('💡', 'Luces y Botones', [
                row('Encendido eléctrico', d.encendidoElectrico),
                row('Cambio botón', d.cambioBoton),
                row('Cambio relay solenoide', d.cambioRelaySolenoide),
                row('Cambio bendix', d.cambioBendix),
                row('Reparación bendix', d.reparacionBendix),
                row('Reparación arrastre burro', d.reparacionArrastreBurro),
                row('Reparación problema eléctrico', d.reparacionProblemaElectrico),
                row('Cuál problema eléctrico', d.cualProblemaElectrico),
                row('Prueba de luces', d.pruebaDeLuces),
                row('Recambio focos', d.recambioFocos),
                row('Prueba botones', d.pruebaBotones),
                row('Recambio botones', d.recambioBotones),
                row('Prueba bocina', d.pruebaBocina),
            ])}

            ${section('🛑', 'Sistema de Frenos', [
                row('Freno delantero', d.frenoDelantero),
                row('Recambio pastillas delanteras', d.recambioPastillasDelantera),
                row('Recambio zapatas delanteras', d.recambioZapatasDelantera),
                row('Líquido freno delantero', d.liquidoFrenoDelantero),
                row('Bomba freno delantera', d.bombaFrenoDelantera),
                row('Cáliper freno delantero', d.calisperFrenoDelantero),
                row('Cable freno delantero', d.cableFrenoDelantero),
                row('Otros freno delantero', d.otrosFrenoDelantero),
                row('Freno trasero', d.frenoTrasero),
                row('Recambio pastillas traseras', d.recambioPastillasTrasera),
                row('Recambio zapatas traseras', d.recambioZapatasTrasera),
                row('Líquido freno trasero', d.liquidoFrenoTrasero),
                row('Bomba freno trasera', d.bombaFrenoTrasera),
                row('Cáliper freno trasero', d.calisperFrenoTrasero),
                row('Varrilla freno trasero', d.varrillaFrenoTrasero),
                row('Otros freno trasero', d.otrosFrenoTrasero),
            ])}

            ${section('🔗', 'Sistema de Arrastre', [
                row('Recambio transmisión completa', d.recambioTransmisionCompleta),
                row('Tipo transmisión', d.tipoTransmision),
                row('Registro lavado y lubricado', d.registroLavadoLubricado),
                row('Cambio tacos/bujes de masa', d.cambioTacosBujesMasa),
                row('Cambio eje trasero', d.cambioEjeTrasero),
                row('Cambio porta corona', d.cambioPortaCorona),
                row('Cambio tornillos y seguros', d.cambioTornillosSeguros),
                row('Cambio rulemanes', d.cambioRulemanes),
                row('Cuáles rulemanes', d.cualesRulemanes),
            ])}

            ${section('🔧', 'Retenes y O-ring', [
                row('Cambio retenes', d.cambioRetenes),
                row('Cuáles retenes', d.cualesRetenes),
                row('Cambio o-ring', d.cambioOring),
                row('Cuáles o-ring', d.cualesOring),
            ])}

            ${section('🌀', 'Sistema de Amortiguación', [
                row('Mantenimiento barras y vástagos', d.mantenimientoBarrasVastagos),
                row('Cambio líquido hidráulico', d.cambioLiquidoHidraulico),
                row('Cambio resortes', d.cambioResortes),
                row('Cambio retenes suspensión', d.cambioRetenesSuspension),
                row('Medidas retenes suspensión', d.medidasRetenesSuspension),
                row('Cambio bolilleros direccionales', d.cambioBolillerosDireccionales),
                row('Mantenimiento trasero amortiguación', d.mantenimientoTraserAmortiguacion),
                row('Cambio bujes horquillón', d.cambioBujesHorquillon),
                row('Medida bujes horquillón', d.medidaBujesHorquillon),
                row('Cambio eje horquillón', d.cambioEjeHorquillon),
                row('Cambio bujes monoshock', d.cambioBujesMonoshock),
                row('Cambio monoshock', d.cambioMonoshock),
                row('Cambio amortiguadores', d.cambioAmortiguadores),
            ])}

            ${section('📊', 'Tablero', [
                row('Problema eléctrico tablero', d.problemaElectricoTablero),
                row('Cuál problema tablero', d.cualProblemaTablero),
                row('Velocímetro', d.velocimetro),
                row('Cambio retorno', d.cambioRetorno),
                row('Cambio cable tablero', d.cambioCableTablero),
            ])}

            ${d.otrosTrabajos && d.otrosTrabajos.trim()
                ? `<div class="info-box"><h4>📝 Otros trabajos</h4><div class="data-item">${d.otrosTrabajos}</div></div>`
                : ''}
        ` : '<p style="color: #666; font-style: italic;">No hay ficha técnica registrada.</p>';

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                .header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
                .info-box { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #d32f2f; border-radius: 4px; }
                .section-title { background-color: #333; color: white; padding: 10px; margin: 20px 0 10px 0; border-radius: 4px; }
                .data-item { padding: 8px; border-bottom: 1px solid #eee; }
                .label { font-weight: bold; color: #d32f2f; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>

            <div class="header">
                <h1>🏍️ Taller Tobías</h1>
                <h2>Recordatorio de Servicio</h2>
            </div>

            <div class="content">

                <div class="info-box">
                    <h3>📋 Información del Cliente</h3>
                    <div class="data-item"><span class="label">Cliente:</span> ${registro.nombre}</div>
                    <div class="data-item"><span class="label">Teléfono:</span> ${registro.telefono}</div>
                    ${registro.email ? `<div class="data-item"><span class="label">Email:</span> ${registro.email}</div>` : ''}
                </div>

                <div class="info-box">
                    <h3>🏍️ Información de la Moto</h3>
                    <div class="data-item"><span class="label">Marca:</span> ${registro.Motos?.[0]?.marca || ''}</div>
                    <div class="data-item"><span class="label">Modelo:</span> ${registro.Motos?.[0]?.modelo || ''}</div>
                    ${registro.Motos?.[0]?.km ? `<div class="data-item"><span class="label">Kilómetros:</span> ${registro.Motos?.[0]?.km}</div>` : ''}
                </div>

                <div class="info-box">
                    <h3>🔧 Servicio a Realizar</h3>
                    <div class="data-item">
                        <span class="label">Descripción:</span> ${servicio.descripcionProximoServicio || 'No especificado'}
                    </div>
                    ${servicio.kmProximoServicio ? `<div class="data-item"><span class="label">KM próximo servicio:</span> ${servicio.kmProximoServicio}</div>` : ''}
                </div>

                ${fichaHTML}
            </div>

            <div class="footer">
                <p>🔧 Taller Tobías - Servicio de Mecánica</p>
                <p>📧 tallertobias@outlook.com</p>
            </div>

        </body>
        </html>
        `;
    }
}

// Exportar una instancia única del servicio
module.exports = new EmailService();

