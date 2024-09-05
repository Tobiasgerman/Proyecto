const obtenerListaJuegos = require('../obtenerListaJuegos');
const { procesarJuegos } = require('./guardarJuego');
const sequelize = require('../sequelize');
require('../relations');

async function iniciar() {
    await sequelize.sync({ alter: true });
console.log('Tablas sincronizadas correctamente.');

try {
    // Obtén y guarda juegos conocidos
    console.log('Obteniendo juegos conocidos...');
    const juegosConocidos = await obtenerListaJuegos(true);
    console.log(`Se obtuvieron ${juegosConocidos.length} juegos conocidos.`);
    await procesarJuegos(juegosConocidos);
    console.log('Juegos conocidos guardados correctamente.');

    // Obtén y guarda juegos no conocidos
    console.log('Obteniendo juegos no conocidos...');
    const juegosNoConocidos = await obtenerListaJuegos(false);
    console.log(`Se obtuvieron ${juegosNoConocidos.length} juegos no conocidos.`);
    await procesarJuegos(juegosNoConocidos);
    console.log('Juegos no conocidos guardados correctamente.');

    console.log('Todos los juegos han sido guardados exitosamente.');

} catch (error) {
    console.error('Error al iniciar la aplicación:', error);
}
}

iniciar();