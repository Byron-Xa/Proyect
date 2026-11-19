const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/rolMiddleware');

router.get('/me', verifyToken, checkRole('usuarios', 'informacion_cuenta'), userController.getMe);
router.put('/me', verifyToken, checkRole('usuarios', 'dato_personal'), userController.updateMe);
router.put('/me/password', verifyToken, checkRole('usuarios', 'cambiar_contraseña'), userController.PasswordActualizando);

router.get('/stats', verifyToken, checkRole('usuarios'), userController.getUsersActivos);
router.get('/', verifyToken, checkRole('usuarios'), userController.getUsers);
router.post('/', verifyToken, checkRole('usuarios'), userController.createUser);
router.put('/:id', verifyToken, checkRole('usuarios'), userController.updateUser);
router.delete('/:id', verifyToken, checkRole('usuarios'), userController.deleteUser);

module.exports = router;