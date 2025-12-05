const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/categorias', require('./routes/categoryRoutes'));
app.use('/api/v1/productos', require('./routes/productRoutes'));

// Ruta de prueba
app.get('/api/v1/health', (req, res) => {
  res.json({ message: 'API LoboShop funcionando correctamente' });
});

module.exports = app;

