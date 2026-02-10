const db = require('../config/db');

exports.getAppointments = async (req, res) => {
    try {
        const { doctor_id, start_date, end_date } = req.query;
        let query = `
      SELECT a.*, p.first_name, p.last_name, p.document_id 
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE 1=1
    `;
        const params = [];

        if (doctor_id) {
            params.push(doctor_id);
            query += ` AND a.doctor_id = $${params.length}`;
        }

        if (start_date && end_date) {
            params.push(start_date, end_date);
            query += ` AND a.start_time >= $${params.length - 1} AND a.end_time <= $${params.length}`;
        }

        query += ' ORDER BY a.start_time ASC';
        const { rows } = await db.query(query, params);

        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        const { patient_id, doctor_id, start_time, end_time, reason } = req.body;

        // Check for overlap (Simple logic: existing start < new end AND existing end > new start)
        const overlapCheck = await db.query(
            `SELECT * FROM appointments 
       WHERE doctor_id = $1 
       AND status != 'cancelada'
       AND (start_time < $3 AND end_time > $2)`,
            [doctor_id, start_time, end_time]
        );

        if (overlapCheck.rows.length > 0) {
            return res.status(409).json({ message: 'El doctor ya tiene una cita en este horario.' });
        }

        const { rows } = await db.query(
            'INSERT INTO appointments (patient_id, doctor_id, start_time, end_time, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [patient_id, doctor_id, start_time, end_time, reason]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const { rows } = await db.query(
            'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (rows.length === 0) return res.status(404).json({ message: 'Cita no encontrada' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
