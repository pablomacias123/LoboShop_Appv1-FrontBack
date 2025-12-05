const express = require('express');
const router = express.Router();
const {
  crearProducto,
  obtenerProductos,
  obtenerProducto,
  obtenerMisProductos,
  actualizarProducto,
  eliminarProducto,
  eliminarImagen
} = require('../controllers/productController');
const { proteger } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

// Rutas públicas
router.get('/', obtenerProductos);
router.get('/:id', obtenerProducto);

// Rutas protegidas
router.get('/usuario/mis-productos', proteger, obtenerMisProductos);
router.post('/', proteger, upload.array('imagenes', 5), crearProducto);
router.put('/:id', proteger, upload.array('imagenes', 5), actualizarProducto);
router.delete('/:id', proteger, eliminarProducto);
router.delete('/:id/imagenes/:imagenId', proteger, eliminarImagen);

module.exports = router;
