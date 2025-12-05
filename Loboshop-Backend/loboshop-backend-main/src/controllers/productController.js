const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// @desc    Crear nuevo producto
// @route   POST /api/v1/productos
// @access  Private
exports.crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria, estado, contacto } = req.body;

    // Procesar imágenes si existen
    let imagenes = [];
    if (req.files && req.files.length > 0) {
      imagenes = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        publicId: file.filename
      }));
    }

    const producto = await Product.create({
      nombre,
      descripcion,
      precio,
      categoria,
      estado,
      imagenes,
      vendedor: req.usuario.id,
      contacto: contacto ? JSON.parse(contacto) : {}
    });

    // Poblar datos del vendedor y categoría
    await producto.populate('vendedor', 'nombre email');
    await producto.populate('categoria', 'nombre');

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
};

// @desc    Obtener todos los productos con filtros y búsqueda
// @route   GET /api/v1/productos
// @access  Public
exports.obtenerProductos = async (req, res) => {
  try {
    const { categoria, busqueda, minPrecio, maxPrecio, estado, vendedor, page = 1, limit = 10 } = req.query;

    // Construir query
    let query = { disponible: true };

    // Filtro por categoría
    if (categoria) {
      query.categoria = categoria;
    }

    // Filtro por vendedor
    if (vendedor) {
      query.vendedor = vendedor;
    }

    // Filtro por rango de precio
    if (minPrecio || maxPrecio) {
      query.precio = {};
      if (minPrecio) query.precio.$gte = Number(minPrecio);
      if (maxPrecio) query.precio.$lte = Number(maxPrecio);
    }

    // Filtro por estado
    if (estado) {
      query.estado = estado;
    }

    // Búsqueda por texto
    if (busqueda) {
      query.$text = { $search: busqueda };
    }

    // Paginación
    const skip = (page - 1) * limit;

    // Ejecutar query con población de datos
    const productos = await Product.find(query)
      .populate('vendedor', 'nombre email telefono')
      .populate('categoria', 'nombre icono')
      .sort({ fechaCreacion: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Contar total de documentos
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: productos.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      productos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/v1/productos/:id
// @access  Public
exports.obtenerProducto = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id)
      .populate('vendedor', 'nombre email telefono')
      .populate('categoria', 'nombre icono');

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Incrementar contador de vistas
    producto.vistas += 1;
    await producto.save();

    res.status(200).json({
      success: true,
      producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
};

// @desc    Obtener productos del usuario actual
// @route   GET /api/v1/productos/mis-productos
// @access  Private
exports.obtenerMisProductos = async (req, res) => {
  try {
    const productos = await Product.find({ vendedor: req.usuario.id })
      .populate('categoria', 'nombre icono')
      .sort({ fechaCreacion: -1 });

    res.status(200).json({
      success: true,
      count: productos.length,
      productos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus productos',
      error: error.message
    });
  }
};

// @desc    Actualizar producto
// @route   PUT /api/v1/productos/:id
// @access  Private
exports.actualizarProducto = async (req, res) => {
  try {
    let producto = await Product.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar que el usuario sea el dueño del producto
    if (producto.vendedor.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este producto'
      });
    }

    // Procesar nuevas imágenes si existen
    if (req.files && req.files.length > 0) {
      const nuevasImagenes = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        publicId: file.filename
      }));
      req.body.imagenes = [...producto.imagenes, ...nuevasImagenes];
    }

    // Parsear contacto si viene como string
    if (req.body.contacto && typeof req.body.contacto === 'string') {
      req.body.contacto = JSON.parse(req.body.contacto);
    }

    producto = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('vendedor', 'nombre email')
      .populate('categoria', 'nombre');

    res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
      producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
};

// @desc    Eliminar producto
// @route   DELETE /api/v1/productos/:id
// @access  Private
exports.eliminarProducto = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar que el usuario sea el dueño del producto
    if (producto.vendedor.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este producto'
      });
    }

    // Eliminar imágenes del servidor
    if (producto.imagenes && producto.imagenes.length > 0) {
      producto.imagenes.forEach(imagen => {
        const filePath = path.join(__dirname, '../../', imagen.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
};

// @desc    Eliminar una imagen específica del producto
// @route   DELETE /api/v1/productos/:id/imagenes/:imagenId
// @access  Private
exports.eliminarImagen = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar permiso
    if (producto.vendedor.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta imagen'
      });
    }

    // Encontrar la imagen
    const imagen = producto.imagenes.find(img => img._id.toString() === req.params.imagenId);

    if (!imagen) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Eliminar archivo del servidor
    const filePath = path.join(__dirname, '../../', imagen.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remover imagen del array
    producto.imagenes = producto.imagenes.filter(
      img => img._id.toString() !== req.params.imagenId
    );
    await producto.save();

    res.status(200).json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen',
      error: error.message
    });
  }
};
