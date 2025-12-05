const express = require('express');
const router = express.Router();
const {
  registro,
  login,
  obtenerPerfil
} = require('../controllers/authController');
const { proteger } = require('../middlewares/authMiddleware');

router.post('/registro', registro);
router.post('/login', login);
router.get('/perfil', proteger, obtenerPerfil);

module.exports = router;
