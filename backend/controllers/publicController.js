const db = require('../config/db');

// Mock Google Calendar Integration: Query local appointments to find slots.
exports.getAvailability = async (req, res) => {
    try {
        const { date } = req.query; // YYYY-MM-DD
        if (!date) return res.status(400).json({ error: 'Date is required' });

        // Assuming clinic hours 09:00 - 18:00 (one slot per hour for simplicity)
        const slots = [
            '09:00', '10:00', '11:00', '12:00', '13:00', // Lunch break
            '15:00', '16:00', '17:00'
        ];

        // Find taken slots for the given date
        const startOfDay = `${date} 00:00:00`;
        const endOfDay = `${date} 23:59:59`;

        // Check appointments in this range
        const { rows } = await db.query(
            "SELECT start_time FROM appointments WHERE start_time BETWEEN $1 AND $2 AND status != 'cancelada'",
            [startOfDay, endOfDay]
        );

        // Map taken times to simple hour strings
        const takenTimes = rows.map(r => {
            const d = new Date(r.start_time);
            return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        });

        // Filter available slots
        const available = slots.filter(slot => !takenTimes.includes(slot));

        res.status(200).json({ date, available });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createLead = async (req, res) => {
    try {
        const { full_name, email, phone, message } = req.body;

        const { rows } = await db.query(
            'INSERT INTO leads (full_name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
            [full_name, email, phone, message]
        );

        // Here we would ideally trigger an email to the doctor
        console.log(`Lead created: ${email}`);

        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.publicBooking = async (req, res) => {
    try {
        const { full_name, email, phone, start_time, reason } = req.body;

        // Check if patient exists by email, create if not
        let patientId;
        const existingPatient = await db.query('SELECT id FROM patients WHERE email = $1', [email]);

        if (existingPatient.rows.length > 0) {
            patientId = existingPatient.rows[0].id;
        } else {
            // Create simplified patient record
            const newP = await db.query(
                'INSERT INTO patients (first_name, last_name, email, phone, document_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [full_name.split(' ')[0], full_name.split(' ').slice(1).join(' ') || 'Web-Lead', email, phone, `TEMP-${Date.now()}`]
            );
            patientId = newP.rows[0].id;
        }

        // Create Appointment (Status default: 'pendiente')
        // Duration default: 1 hour
        const endTime = new Date(new Date(start_time).getTime() + 60 * 60000).toISOString();

        // Check availability again just in case
        // For now skipping strict overlap check here as it's handled by main logic or DB constraint

        const { rows } = await db.query(
            "INSERT INTO appointments (patient_id, start_time, end_time, reason, status) VALUES ($1, $2, $3, $4, 'pendiente') RETURNING *",
            [patientId, start_time, endTime, reason || 'Web Inquiry']
        );

        res.status(201).json({ message: 'Cita solicitada con éxito. Pendiente de confirmación.', data: rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.processSurvey = async (req, res) => {
    try {
        const { token, rating, comments } = req.body;

        // Validate token
        const tokenCheck = await db.query("SELECT * FROM temporary_tokens WHERE token = $1 AND expires_at > NOW() AND used = FALSE", [token]);

        if (tokenCheck.rows.length === 0) {
            return res.status(400).json({ message: 'Token inválido o expirado.' });
        }

        // Save survey
        // (Assuming token is linked to appointment_id in related_id)
        const appointmentId = tokenCheck.rows[0].related_id;

        await db.query(
            "INSERT INTO surveys (appointment_id, rating, comments) VALUES ($1, $2, $3)",
            [appointmentId, rating, comments]
        );

        // Mark token used
        await db.query("UPDATE temporary_tokens SET used = TRUE WHERE id = $1", [tokenCheck.rows[0].id]);

        res.status(200).json({ message: 'Gracias por su feedback!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
