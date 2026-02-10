const db = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const { patientId, stage, notes } = req.body;

        // In real app, upload to Cloud. Here save path.
        const imagePath = `/uploads/${req.file.filename}`;

        const { rows } = await db.query(
            'INSERT INTO orthodontic_gallery (patient_id, image_url, stage, notes) VALUES ($1, $2, $3, $4) RETURNING *',
            [patientId, imagePath, stage, notes]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getGallery = async (req, res) => {
    try {
        const { patientId } = req.params;

        const { rows } = await db.query(
            'SELECT * FROM orthodontic_gallery WHERE patient_id = $1 ORDER BY created_at DESC',
            [patientId]
        );

        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
