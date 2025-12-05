require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');

// Datos de categorías iniciales
const categoriasIniciales = [
  {
    nombre: 'Electrónica',
    descripcion: 'Dispositivos electrónicos, computadoras, celulares',
    icono: 'phone-portrait-outline'
  },
  {
    nombre: 'Ropa y Accesorios',
    descripcion: 'Ropa, zapatos, accesorios de moda',
    icono: 'shirt-outline'
  },
  {
    nombre: 'Hogar y Jardín',
    descripcion: 'Muebles, decoración, herramientas',
    icono: 'home-outline'
  },
  {
    nombre: 'Deportes',
    descripcion: 'Equipamiento deportivo y fitness',
    icono: 'football-outline'
  },
  {
    nombre: 'Libros y Música',
    descripcion: 'Libros, instrumentos musicales, discos',
    icono: 'book-outline'
  },
  {
    nombre: 'Vehículos',
    descripcion: 'Autos, motos, bicicletas',
    icono: 'car-outline'
  },
  {
    nombre: 'Otros',
    descripcion: 'Artículos varios',
    icono: 'ellipsis-horizontal-outline'
  }
];

// Función principal para seed
const seedDatabase = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB');

    // Eliminar categorías existentes
    await Category.deleteMany({});
    console.log('🗑️  Categorías anteriores eliminadas');

    // Insertar nuevas categorías
    const categorias = await Category.insertMany(categoriasIniciales);
    console.log(`✅ ${categorias.length} categorías creadas exitosamente`);

    // Mostrar categorías creadas
    console.log('\n📋 Categorías creadas:');
    categorias.forEach(cat => {
      console.log(`   - ${cat.nombre} (${cat.icono})`);
    });

    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n✅ Conexión cerrada. Seed completado exitosamente');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar seed:', error);
    process.exit(1);
  }
};

// Ejecutar seed
seedDatabase();
