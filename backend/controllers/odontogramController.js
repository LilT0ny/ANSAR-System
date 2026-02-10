const db = require('../config/db');

exports.getOdontogram = async (req, res) => {
    try {
        const { patientId } = req.params;

        const { rows } = await db.query(
            'SELECT data FROM odontograms WHERE patient_id = $1 ORDER BY last_updated DESC LIMIT 1',
            [patientId]
        );

        if (rows.length === 0) {
            // Return empty default state if none exists
            return res.status(200).json({ data: {} });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOdontogram = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { data } = req.body; // Full JSON object of teeth state

        // Upsert logic: Check if exists, update or create
        const check = await db.query('SELECT id FROM odontograms WHERE patient_id = $1 LIMIT 1', [patientId]);

        let result;
        if (check.rows.length > 0) {
            const { rows } = await db.query(
                'UPDATE odontograms SET data = $1, last_updated = NOW(), updated_by = $2 WHERE patient_id = $3 RETURNING *',
                [data, req.user.id, patientId]
            );
            result = rows[0];
        } else {
            const { rows } = await db.query(
                'INSERT INTO odontograms (patient_id, data, updated_by) VALUES ($1, $2, $3) RETURNING *',
                [patientId, data, req.user.id]
            );
            result = rows[0];
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
