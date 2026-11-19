const userModel = require('../models/userModel');
const MenuAdmin = require('../Libraries/MenuAdmin');
const db = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {

    let user = null;
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = req.body.password;

        if (!email || typeof password !== 'string' || !password) {
            return res.status(400).json({message: 'Ingrese su correo electronico y contraseña'});
        }

        if (!process.env.JWT_SECRET){
            throw new Error('JWT_SECRET no esta configurado');
        };

        const result  = await userModel.findUserByEmail(email);
        user = Array.isArray(result) ? result[0] :result;

        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas'});
        };

        if (user.activo !== 'A') {
            return res.status(401).json({message: 'La cuenta esta Inactivo'});
        };

        if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date){
            return res.status(423).json({message: 'Cuenta bloqueada temporalmente. Intente mas tarde.'})
        };

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {

            await userModel.registroIntentosFallidos(user.id);

            return res.status(401).json({message: 'Credenciales incorrectos'});
        }

        await userModel.resetFailedAttempts(user.id);

        const rolId = Number(user.rol_id);

        const menus = await new MenuAdmin().createMenu(user.id, user.rol_id);

       let permisos = [];

if (user.rol_id === 1) {
    // 🔥 SUPERADMIN → acceso total
    const [allSubmenus] = await db.query(`
        SELECT ruta FROM submenus
    `);

    permisos = allSubmenus.map(sub => ({
        ruta: sub.ruta,
        puede_crear: 1,
        puede_ver: 1,
        puede_editar: 1,
        puede_eliminar: 1
    }));

} else {
    const [rows] = await db.query(`
        SELECT s.ruta, p.puede_crear, p.puede_ver, p.puede_editar, p.puede_eliminar
        FROM permisos p
        JOIN submenus s ON s.id = p.submenu_id
        WHERE p.rol_id = ?
    `, [user.rol_id]);

    permisos = rows;
}
        const token = jwt.sign({ id: user.id, username:user.username, rol:user.rol, rolid: user.rol_id, version:user.token_version }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({token, user: { rolid: user.rol_id, username: user.username, rolusuario: user.rol, color: user.color}, menus, permisos});
    } catch (error) {
        console.error('Error al autenticar:', error);
        res.status(500).json({ message: 'Error al autenticar' });
    }
};

exports.logout = async (req, res) => {
    try {
        await db.query(`UPDATE usuarios SET token_version = token_version + 1 WHERE id = ?`, [req.user.id]);

        return res.json({message: 'Sesión cerrada correctamente'});

    } catch (error) {
        return res.status(500).json({ message: 'Error al cerrar sesión'});
    }
};