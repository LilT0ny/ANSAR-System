const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'No ests autenticado. Por favor inicia sesin.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'El usuario ya no existe.' });
        }

        req.user = rows[0];
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invlido.' });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'No tienes permiso para realizar esta accin.' });
        }
        next();
    };
};
