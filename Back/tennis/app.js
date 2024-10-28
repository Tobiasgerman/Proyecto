const axios = require('axios');
const https = require('https');
const { tennis } = require('../sequelize/models'); // Asegúrate de que la ruta al modelo sea correcta

const query = `
  SELECT ?name ?nationality ?birthDate ?height ?weight WHERE {
    ?player a dbo:TennisPlayer ;
            foaf:name ?name ;
            dbo:birthDate ?birthDate ;
            dbo:height ?height ;
            dbo:weight ?weight ;
            dbo:nationality ?nationality .
  }
  LIMIT 100
`;

const url = 'https://dbpedia.org/sparql';

// Crear un agente HTTPS que ignore errores de certificado
const httpsAgent = new https.Agent({  
  rejectUnauthorized: false
});

const saveTennisPlayersToDB = async () => {
  try {
    const response = await axios.get(url, {
      params: {
        query: query,
        format: 'json'
      },
      httpsAgent: httpsAgent // Pasar el agente que ignora SSL
    });

    const players = response.data.results.bindings;

    for (const player of players) {
      await tennis.create({
        nombre: player.name.value.split(" ")[0],
        apellido: player.name.value.split(" ")[1] || '',
        nacionalidad: player.nationality.value,
        cumpleaños: player.birthDate.value,
        Altura: parseInt(player.height.value), // Altura en cm
        peso: parseInt(player.weight.value),  // Peso en kg
      });
    }

    console.log('Jugadores de tenis guardados correctamente.');
  } catch (error) {
    console.error('Error al obtener jugadores de tenis:', error);
  }
};

// Sincroniza la base de datos y guarda los datos
tennis.sync()
  .then(() => {
    console.log('Tabla de tenis sincronizada correctamente.');
    saveTennisPlayersToDB();
  })
  .catch(error => {
    console.error('Error al sincronizar la tabla:', error);
  });
