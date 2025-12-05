const express = require('express');
const router = express.Router();
const {
  crearCategoria,
  obtenerCategorias,
  obtenerCategoria,
  actualizarCategoria,
  eliminarCategoria
} = require('../controllers/categoryController');
const { proteger } = require('../middlewares/authMiddleware');

router.get('/', obtenerCategorias);
router.get('/:id', obtenerCategoria);

// Rutas protegidas (requieren autenticación)
router.post('/', proteger, crearCategoria);
router.put('/:id', proteger, actualizarCategoria);
router.delete('/:id', proteger, eliminarCategoria);

module.exports = router;
