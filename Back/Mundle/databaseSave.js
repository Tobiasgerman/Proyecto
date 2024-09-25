const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false }); // Configuración de httpsAgent
const sequelize = require ('./Database/sequelize.js');
const {Paises} = require ('./Database/models.js');


async function obtenerLista() {
    let url = 'https://restcountries.com/v3.1/all';

    try {
        let response = await axios.get(url, { httpsAgent });
        
        // Filtrar y mapear los nombres de los países en español
        let paisesEsp = response.data
            .filter(p => p.translations && p.translations.spa && p.latlng) // Asegúrate de que haya latlng
            .map(p => ({
                nombre: p.translations.spa.common, // Usar nombre oficial
                latitud: p.latlng[0], // Obtener latitud
                longitud: p.latlng[1], // Obtener longitud
            }));

        // Guardar los países en la base de datos
        for (const pais of paisesEsp) {
            try {
                await Paises.create(pais); // Guarda cada país
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    console.log(`El país ${pais.nombre} ya existe en la base de datos.`);
                } else {
                    console.error('Error al guardar el país:', error);
                }
            }
        }

        console.log('Paises guardados exitosamente en la base de datos.');
    } catch (error) {
        console.log('Error al obtener la lista de países:', error.message);
    }
}

// Función principal para ejecutar el código
(async () => {
    try {

        await sequelize.sync({ alter: true }); // Sincroniza el modelo con la base de datos, elimina la tabla si existe
        await obtenerLista(); // Llama a la función para obtener y guardar los países
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
})();
