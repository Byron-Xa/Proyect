const db = require('../db/db');

exports.findUserByEmail = async (email) => {
    const [rows] = await db.query(`SELECT u.id, u.username, u.email, u.password, u.token_version, u.activo, u.intentos_fallidos, u.bloqueado_hasta, r.nombre AS rol, r.color AS color, r.id AS rol_id FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.email = ? LIMIT 1`, [email]);
    return rows || NULL;
};

exports.registroIntentosFallidos = async (userId) => {
    await db.query(
        `UPDATE usuarios
         SET intentos_fallidos = intentos_fallidos + 1,
             bloqueado_hasta = IF(intentos_fallidos >= 5, DATE_ADD(NOW(), INTERVAL 30 MINUTE), bloqueado_hasta)
         WHERE id = ?`,
        [userId]
    );
};

exports.resetFailedAttempts = async (userId) => {
    await db.query(`UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_login = NOW() WHERE id  = ?`, [userId])
};

exports.invalidateTokensByRol = async (rol_id) => {
    await db.query(`UPDATE usuarios SET token_version = token_version + 1 WHERE rol_id = ?`, [rol_id]);
};

exports.getUsers = async () => {
    const [rows] = await db.query(`SELECT u.id, u.nombre, u.apellido, u.email, u.activo, u.username, u.ultimo_login, u.password_changed_at, r.nombre AS rol, u.rol_id, r.color FROM usuarios u JOIN roles r ON u.rol_id = r.id ORDER BY u.id ASC`);
    return rows;
}

exports.getUserStates = async () => {
    const [rows] = await db.query(`SELECT COUNT(*) AS total, SUM(CASE WHEN activo = 'A' THEN 1 ELSE 0 END) AS activos, SUM(CASE WHEN activo = 'I' THEN 1 ELSE 0 END) AS Inactivos FROM usuarios `);
    return rows[0]
}

exports.getUsersId = async (userId) => {
    const [rows] = await db.query(`SELECT u.id, u.nombre, u.apellido, u.email, u.activo, u.username, u.ultimo_login, r.nombre AS rol, u.rol_id, r.color FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = ? LIMIT 1`, [userId]);
    return rows[0] || NULL;
}

exports.createUser = async (data) => {
    const [rows] = await db.query(`INSERT INTO usuarios (nombre, apellido, email, username, password, rol_id, activo) VALUES (?, ?, ?, ?, ?, ?, ?)`, [data.nombre, data.apellido, data.email, data.username, data.password, data.rol_id, data.activo]);
    return rows;
}

exports.updateUser = async (id, data) => {
    const campos = ['nombre = ?', 'apellido = ?', 'email = ?', 'username = ?', 'rol_id = ?', 'activo = ?'];

    const params = [data.nombre, data.apellido, data.email, data.username, data.rol_id, data.activo]; 

    if (data.password) {
        campos.push('password = ?')
        params.push(data.password);
    }

    params.push(id);

    const [result] = await db.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, params);

    return true;
}

exports.updateProfile = async (id, data) => {
    const [result] = await db.query(
        `UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, username = ? WHERE id = ?`,
        [data.nombre, data.apellido, data.email, data.username, id]
    );
    return result;
};

exports.getPasswordHash = async (id) => {
    const [rows] = await db.query(`SELECT password FROM usuarios WHERE id = ? LIMIT 1`, [id]);
    return rows[0]?.password || NULL
};

exports.updatePassword = async (id, hash) => {
    const [result] = await db.query(`UPDATE usuarios SET password = ?, token_version = token_version + 1 WHERE id = ?`,[hash, id]);
    return result;
}
exports.deleteUser = async (id) => {
    await db.query(`DELETE FROM usuarios WHERE id = ?`, [id]);
    return true;
}