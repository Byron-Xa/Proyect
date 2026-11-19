const validateLogin = (req, res, next) => {
    const {email, password} = req.body || {};

    if (!email || !password) {
        return res.status(400).json({message: 'El correo y la contraseña son obligatorios'});
    }

    if (typeof email !== 'string' || typeof password !== 'string')
    {
        return res.status(400).json({message: 'Los datos enviados no son validos'});
    }

    const correo = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(correo) || correo.length > 254){
        return res.status(400).json({message:'El formato no es valido'});
    }

    if (password.length < 1 || password.length > 128) {
        return res.status(400).json({message: 'la contraseña no cumple con el formato permitido'})
    }

    req.body.email = correo;

    next();
};
module.exports = validateLogin;