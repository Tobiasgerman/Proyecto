const axios = require('axios');
const readline = require('readline');
const https = require('https');
require('dotenv').config();

const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN;
const IGDB_API_URL = 'https://api.igdb.com/v4/games';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function obtenerListaJuegos() {
  try {
    let pagina = Math.floor(Math.random() * 10) + 1;
    let respuesta = await axios.post(
      IGDB_API_URL,
      `fields name, platforms, genres, tags; limit 10; offset ${pagina * 10};`,
      {
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'text/plain'
        },
        httpsAgent
      }
    );
    let juegoRandomIndex = Math.floor(Math.random() * respuesta.data.length);
    return respuesta.data[juegoRandomIndex];
  } catch (error) {
    console.error('Error al obtener la lista de juegos:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function obtenerJuegoSolicitado(juego) {
  try {
    let respuesta = await axios.post(
      IGDB_API_URL,
      `fields name, platforms, genres, tags; search "${juego}";`,
      {
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'text/plain'
        },
        httpsAgent
      }
    );
    return respuesta.data[0];
  } catch (error) {
    console.error('Error al obtener el juego solicitado:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function main() {
  let juegoAleatorio = await obtenerListaJuegos();

  if (!juegoAleatorio) {
    console.log('No se pudo obtener un juego aleatorio.');
    return;
  }

  let plataformaAleatoria = juegoAleatorio.platforms ? juegoAleatorio.platforms.map(platform => platform.name) : [];
  let generosAleatorio = juegoAleatorio.genres ? juegoAleatorio.genres.map(genre => genre.name) : [];
  let sagaAleatoria = juegoAleatorio.tags 
    ? juegoAleatorio.tags.find(tag => tag.name && tag.name.includes('series'))?.name || 'No Saga'
    : 'No Saga';
  let intentos = 0;

  const jugar = async () => {
    rl.question('Elige un Juego: ', async (juego) => {
      let juegoElegido = await obtenerJuegoSolicitado(juego);

      if (!juegoElegido) {
        console.log('Juego no encontrado.');
        jugar(); // Volver a preguntar
        return;
      }

      let plataformaElegida = juegoElegido.platforms ? juegoElegido.platforms.map(platform => platform.name) : [];
      let generosElegido = juegoElegido.genres ? juegoElegido.genres.map(genre => genre.name) : [];
      let sagaElegida = juegoElegido.tags 
        ? juegoElegido.tags.find(tag => tag.name && tag.name.includes('series'))?.name || 'No Saga'
        : 'No Saga';

      if (juegoElegido.name === juegoAleatorio.name) {
        rl.close();
        console.log('¡Ganaste!');
        return;
      } else {
        const coincidenciaGeneros = generosElegido.filter(category => generosAleatorio.includes(category));
        const coincidenciaPlataforma = plataformaElegida.filter(platform => plataformaAleatoria.includes(platform));
        const coincidenciaSaga = sagaElegida === sagaAleatoria;

        const resultadoGenero = generosElegido.length > 0
          ? (coincidenciaGeneros.length === generosElegido.length ? 'Verde' : 'Amarillo')
          : 'Rojo';

        const resultadoPlataforma = plataformaElegida.length > 0
          ? (coincidenciaPlataforma.length === plataformaElegida.length ? 'Verde' : 'Amarillo')
          : 'Rojo';

        const resultadoSaga = sagaElegida === sagaAleatoria ? 'Verde' : 'Rojo';

        console.log(`Generos: ${resultadoGenero}`);
        console.log(`Plataforma: ${resultadoPlataforma}`);
        console.log(`Saga: ${resultadoSaga}`);
        intentos++;
        console.log(`Intentos: ${intentos}`);

        if (intentos < 5) {
          jugar(); 
        } else {
          rl.close();
          console.log('Perdiste! El juego era:', juegoAleatorio.name);
        }
      }
    });
  };

  jugar();
}

main();
