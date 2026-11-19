const jwt = require('jsonwebtoken');
const db = require('../db/db');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ message: 'No se ha proporcionado un token válido' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'token válido invalido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.id || decoded.version === undefined) {
            return res.status(401).json({message: 'Token incompleto o invalido'});
        }
        
        const [rows] = await db.query('SELECT id, rol_id, activo, token_version FROM usuarios WHERE id = ? LIMIT 1', [decoded.id]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no valido' });
        }

        const user = rows[0]

        if (user.activo !== 'A'){
            return res.status(403).json({message: 'Cuenta inactiva'});
        }

        if (Number(decoded.version) !== Number(user.token_version)) {
            return res.status(401).json({ message: 'Session revocada. Inicie session nuevamente' });
        }
        req.user = { ...decoded, id:user.id, username:user.username, email:user.email, rol_id:user.rol_id };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError')
        {
            return res.status(401).json({message: 'La session ha expirado'});
        }

        if (error.name === 'JsonWebTokenError')
        {
            return res.status(401).json({ message: 'Token invalido'});
        }

        console.error('Error Verificando token:', error);

        return res.status(500).json({message: 'Error verficando la session'});
    }
};

module.exports = verifyToken;