const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const presence = require('../helpers/presence')

exports.getUsers = async (req, res) => {
    try {
        const data = await userModel.getUsers();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}

exports.getUserStats = async (req, res) => {
    try {
        const stats = await userModel.getUserStates();
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al obtener las stadisticas de usuarios'})
    }
} 

exports.getUsersActivos = async  (req, res) => {
    try {
        const data = await userModel.getUsers();
        res.json(data.map(u => ({ ...u, online: u.id === req.user.id || presence.isOnline(u.id), })));
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}

exports.getMe = async (req, res) => {
    try{
        const user = await userModel.getUsersId(req.user.id);

        if (!user){
            return res.status(404).json({message: 'Usuario no encontrado'});
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al obtener el usaurio'})
    }
}

exports.createUser = async (req, res) => {
    try {

        const { email, nombre, apellido, username, password, rol_id, activo } = req.body;

        if (!nombre || !apellido || !email || !username || !password || !rol_id || !activo) {
            return res.status(400).json({ message: 'Faltan datos' });
        }

        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!EMAIL_REGEX.test(String(email || '').trim())){
            return res.status(400).json({message: 'Correo electronico invalido'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await userModel.createUser({ nombre, apellido, email, username, password: hashedPassword, rol_id, activo });
        await userModel.invalidateTokensByRol(rol_id);

        res.status(201).json({ message: 'Usuario creado' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, username, password, rol_id, activo } = req.body;

        if (!nombre || !apellido || !email || !username || !rol_id || !activo){
            return res.status(400).json({message: 'Falta campos'})
        }

        const emailLimpio = String(email).trim().toLowerCase();
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!EMAIL_REGEX.test(emailLimpio)){
            return res.status(400).json({message: 'Correo electronico invalido'})
        }

        let hashedPassword = null;

        if (password && password.trim() !== '') {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        await userModel.updateUser(id, {
            nombre,
            apellido,
            email,
            username,
            password: hashedPassword,
            rol_id,
            activo
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({message: 'Usuario no encontrado'})
        }

        await userModel.invalidateTokensByUser(id);


        res.json({ message: 'Usuario actualizado' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar' });
    }
};

exports.updateMe = async (req, res) => {
    try {
        const id = req.user.id;
        const { nombre, apellido, email, username} = req.body;

        const emailLimpio = String(email).trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailLimpio)) {
            return res.status(400).json({ message: 'Correo electrónico inválido' });
        }

        await userModel.updateProfile(id, {
            nombre: String(nombre).trim(),
            apellido: String(apellido).trim(),
            email: emailLimpio,
            username: String(username).trim(),
        });

        res.json({ message: 'Datos actualizados' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El correo o el apodo ya está en uso' });
        }
        res.status(500).json({ message: 'Error al actualizar' });
    }
};

exports.PasswordActualizando = async (req, res) => {
    try {
        const {actual, nueva} = req.body;

        if (typeof actual !== 'string' || typeof nueva !== 'string' || !actual || !nueva) {
            return res.status(400).json({message: 'Falta datos'});
        }

        if (nueva.length < 8) {
            return res.status(400).json({message: 'La nueva contraseña debe tener 8 caracteres'});
        }

        if (actual === nueva) {
            return res.status(400).json({message: 'La nueva contraseña debe ser distinta'});
        } 

        const hashActual = await userModel.getPasswordHash(req.user.id)
        if (!hashActual) {
            return res.status(404).json({message: 'Usuario no encontrado'})
        }

        const nuevoHash = await bcrypt.hash(nueva, 10);
        await userModel.updatePassword(req.user.id, nuevoHash);

        res.json({ message: 'Contraseña actualizada. Inicia sesión nuevamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error al cambiar la contraseña'})
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        await userModel.deleteUser(id);
        

        res.json({ message: 'Usuario eliminado' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar' });
    }
};