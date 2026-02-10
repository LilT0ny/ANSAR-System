const db = require('../config/db');

exports.getAllPatients = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM patients ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Paciente no encontrado' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPatient = async (req, res) => {
    try {
        const { first_name, last_name, document_id, email, phone, date_of_birth, address, city } = req.body;

        // Check constraints manually (or rely on DB)
        const existing = await db.query('SELECT id FROM patients WHERE document_id = $1 OR email = $2', [document_id, email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'El documento o email ya est registrado.' });
        }

        const { rows } = await db.query(
            'INSERT INTO patients (first_name, last_name, document_id, email, phone, date_of_birth, address, city) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [first_name, last_name, document_id, email, phone, date_of_birth, address, city]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const { first_name, last_name, phone, address, city } = req.body;
        const { rows } = await db.query(
            'UPDATE patients SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), phone = COALESCE($3, phone), address = COALESCE($4, address), city = COALESCE($5, city), updated_at = NOW() WHERE id = $6 RETURNING *',
            [first_name, last_name, phone, address, city, req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Paciente no encontrado' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const { rowCount } = await db.query('DELETE FROM patients WHERE id = $1', [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ message: 'Paciente no encontrado' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
