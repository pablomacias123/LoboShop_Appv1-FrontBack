const Category = require('../models/Category');

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

const seedCategorias = async () => {
  try {
    // Eliminar categorías existentes
    await Category.deleteMany({});
    
    // Insertar nuevas categorías
    await Category.insertMany(categoriasIniciales);
    
    console.log('✅ Categorías creadas exitosamente');
  } catch (error) {
    console.error('❌ Error al crear categorías:', error);
  }
};

module.exports = seedCategorias;
