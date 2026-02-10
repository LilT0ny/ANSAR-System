const cron = require('node-cron');
const db = require('../config/db');
const notificationService = require('../services/notificationService');

exports.start = () => {
    // Run every hour. Schedule: "0 * * * *"
    cron.schedule('0 * * * *', async () => {
        console.log('Running appointment reminder cron job...');

        try {
            // Find appointments happening tomorrow (between 24h and 25h from now)
            // Postgres Syntax: NOW() + INTERVAL '1 day'
            const result = await db.query(`
                SELECT a.id, a.start_time, p.first_name, p.email, p.phone
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                WHERE a.start_time BETWEEN NOW() + INTERVAL '24 hours' AND NOW() + INTERVAL '25 hours'
                AND a.status = 'pendiente'
                AND NOT EXISTS (
                    SELECT 1 FROM notification_logs l WHERE l.appointment_id = a.id AND l.type = 'EMAIL' AND l.status = 'SENT'
                )
            `);

            for (const appointment of result.rows) {
                const message = `Hola ${appointment.first_name}, te recordamos tu cita el ${appointment.start_time.toLocaleDateString()} a las ${appointment.start_time.toLocaleTimeString()}.`;

                // Send Email
                if (appointment.email) {
                    await notificationService.sendEmail(appointment.email, 'Recordatorio de Cita', message, `<p>${message}</p>`);
                    await db.query(`INSERT INTO notification_logs (appointment_id, patient_id, type, status, message_content) VALUES ($1, $2, 'EMAIL', 'SENT', $3)`, [appointment.id, appointment.patient_id, message]);
                }

                // Send WhatsApp (if phone provided)
                if (appointment.phone) {
                    // Logic for whatsapp
                    // await notificationService.sendWhatsApp(appointment.phone, message);
                }
            }
        } catch (error) {
            console.error('Cron job error:', error);
        }
    });
};
