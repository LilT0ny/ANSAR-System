const nodemailer = require('nodemailer');

class NotificationService {
    constructor() {
        // In production, use environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
        // Here we might use a test account or fallback
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: process.env.SMTP_PORT || 587,
            auth: {
                user: process.env.SMTP_USER || 'ethereal_user',
                pass: process.env.SMTP_PASS || 'ethereal_pass',
            },
        });
    }

    async sendEmail(to, subject, text, html) {
        try {
            const info = await this.transporter.sendMail({
                from: '"Clínica Dental" <no-reply@clinicadental.com>',
                to,
                subject,
                text,
                html,
            });
            console.log('Message sent: %s', info.messageId);
            return { success: true, id: info.messageId };
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    }

    async sendWhatsApp(to, message) {
        // Placeholder for Twilio/WhatsApp API integration
        // Would need ACCOUNT_SID and AUTH_TOKEN from env
        console.log(`[WhatsApp Mock] Sending to ${to}: ${message}`);
        return { success: true, mock: true };
    }
}

module.exports = new NotificationService();
