require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
const User = require('./src/models/User');

const productosEjemplo = [
  {
    nombre: 'iPhone 13 Pro',
    descripcion: 'iPhone en excelente estado, 128GB, color azul',
    precio: 15000,
    estado: 'como_nuevo',
    contacto: { telefono: '4491234567', whatsapp: '4491234567' }
  },
  {
    nombre: 'MacBook Air M1',
    descripcion: 'Laptop Apple MacBook Air con chip M1, 8GB RAM, 256GB SSD',
    precio: 22000,
    estado: 'nuevo',
    contacto: { telefono: '4491234567' }
  },
  {
    nombre: 'Samsung Galaxy S21',
    descripcion: 'Smartphone Samsung en buen estado, 128GB',
    precio: 8500,
    estado: 'usado',
    contacto: { telefono: '4491234567' }
  },
  {
    nombre: 'Camiseta Nike',
    descripcion: 'Camiseta deportiva Nike original, talla M',
    precio: 450,
    estado: 'nuevo',
    contacto: { telefono: '4491234567' }
  },
  {
    nombre: 'Tenis Adidas',
    descripcion: 'Tenis Adidas Ultraboost, talla 27, color negro',
    precio: 1200,
    estado: 'usado',
    contacto: { telefono: '4491234567' }
  }
];

const seedProductos = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');

    // Obtener categorías
    const categorias = await Category.find();
    if (categorias.length === 0) {
      console.log('❌ No hay categorías. Ejecuta primero: npm run seed');
      process.exit(1);
    }

    // Obtener el primer usuario (el que creaste)
    const usuario = await User.findOne();
    if (!usuario) {
      console.log('❌ No hay usuarios. Crea un usuario primero desde el login');
      process.exit(1);
    }

    console.log(`📦 Usuario encontrado: ${usuario.nombre}`);
    console.log(`📂 Categorías encontradas: ${categorias.length}`);

    // Asignar categorías aleatoriamente
    const electronicsCategory = categorias.find(c => c.nombre === 'Electrónica');
    const ropaCategory = categorias.find(c => c.nombre === 'Ropa y Accesorios');

    const productosConCategoria = productosEjemplo.map((prod, index) => {
      let categoria;
      if (index <= 2) {
        categoria = electronicsCategory || categorias[0];
      } else {
        categoria = ropaCategory || categorias[1];
      }

      return {
        ...prod,
        categoria: categoria._id,
        vendedor: usuario._id,
        imagenes: [],
        disponible: true,
        vistas: Math.floor(Math.random() * 50)
      };
    });

    // Eliminar productos existentes
    await Product.deleteMany({});
    console.log('🗑️  Productos anteriores eliminados');

    // Insertar nuevos productos
    const productos = await Product.insertMany(productosConCategoria);
    console.log(`✅ ${productos.length} productos creados exitosamente`);

    // Mostrar productos creados
    console.log('\n📋 Productos creados:');
    productos.forEach(prod => {
      console.log(`   - ${prod.nombre} - $${prod.precio}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Conexión cerrada. Seed de productos completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar seed:', error);
    process.exit(1);
  }
};

seedProductos();
