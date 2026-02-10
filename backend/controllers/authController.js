const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.register = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;

        // Check existing
        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) return res.status(400).json({ message: 'Email ya registrado.' });

        const hashedPassword = await bcrypt.hash(password, 12);

        const { rows } = await db.query(
            'INSERT INTO users (full_name, email, password_hash, role, active) VALUES ($1, $2, $3, $4, true) RETURNING *',
            [full_name, email, hashedPassword, role || 'doctor']
        );

        const token = signToken(rows[0].id);

        res.status(201).json({
            status: 'success',
            token,
            data: { user: rows[0] }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1) Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({ message: 'Por favor provee email y contrasea!' });
        }

        // 2) Check if user exists && password is correct
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Email o contrasea incorrectos' });
        }

        // 3) If everything ok, send token to client
        const token = signToken(user.id);
        user.password_hash = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: { user }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
