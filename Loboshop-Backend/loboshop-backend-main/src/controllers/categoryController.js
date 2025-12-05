const Category = require('../models/Category');

// @desc    Crear nueva categoría (solo para admin)
// @route   POST /api/v1/categorias
// @access  Private/Admin
exports.crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, icono } = req.body;

    const categoria = await Category.create({
      nombre,
      descripcion,
      icono
    });

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      categoria
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear categoría',
      error: error.message
    });
  }
};

// @desc    Obtener todas las categorías
// @route   GET /api/v1/categorias
// @access  Public
exports.obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Category.find({ activa: true }).sort({ nombre: 1 });

    res.status(200).json({
      success: true,
      count: categorias.length,
      categorias
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

// @desc    Obtener una categoría por ID
// @route   GET /api/v1/categorias/:id
// @access  Public
exports.obtenerCategoria = async (req, res) => {
  try {
    const categoria = await Category.findById(req.params.id);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      categoria
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoría',
      error: error.message
    });
  }
};

// @desc    Actualizar categoría
// @route   PUT /api/v1/categorias/:id
// @access  Private/Admin
exports.actualizarCategoria = async (req, res) => {
  try {
    const categoria = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      categoria
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar categoría',
      error: error.message
    });
  }
};

// @desc    Eliminar categoría
// @route   DELETE /api/v1/categorias/:id
// @access  Private/Admin
exports.eliminarCategoria = async (req, res) => {
  try {
    const categoria = await Category.findByIdAndDelete(req.params.id);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar categoría',
      error: error.message
    });
  }
};
