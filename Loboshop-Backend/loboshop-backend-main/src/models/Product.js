const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La categoría es obligatoria']
  },
  imagenes: [{
    url: String,
    publicId: String
  }],
  estado: {
    type: String,
    enum: ['nuevo', 'usado', 'como_nuevo'],
    default: 'nuevo'
  },
  disponible: {
    type: Boolean,
    default: true
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contacto: {
    telefono: String,
    whatsapp: String
  },
  vistas: {
    type: Number,
    default: 0
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
});

// Índices para mejorar búsquedas
productSchema.index({ nombre: 'text', descripcion: 'text' });
productSchema.index({ categoria: 1, disponible: 1 });
productSchema.index({ vendedor: 1 });

// Middleware para actualizar fecha de modificación
productSchema.pre('save', function(next) {
  this.fechaActualizacion = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
