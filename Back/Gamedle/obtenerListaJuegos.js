const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const dotenv = require('dotenv');
dotenv.config();

const IGDB_API_URL = 'https://api.igdb.com/v4/games';
const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN;

async function obtenerListaJuegos(modoConocido) {
    try {
        let juegos = [];
        let offset = 0;
        const limit = 500; // Ajusta el límite según sea necesario

        while (true) {
            console.log(`Obteniendo juegos desde el offset ${offset}...`);
            let query = `fields name, platforms.name, genres.name, themes.name, game_modes.name, first_release_date, release_dates.human, player_perspectives.name, involved_companies.company.name, game_engines.name; limit ${limit}; offset ${offset};`;

            let respuesta = await axios.post(
                IGDB_API_URL,
                query,
                {
                    headers: {
                        'Client-ID': CLIENT_ID,
                        'Authorization': `Bearer ${ACCESS_TOKEN}`,
                        'Content-Type': 'text/plain'
                    },
                    httpsAgent
                }
            );

            console.log(`Se obtuvieron ${respuesta.data.length} juegos en esta página.`);

            if (respuesta.data.length === 0) {
                break;
            }

            const juegosConModoConocido = respuesta.data.map(juego => ({
                ...juego,
                modoConocido: modoConocido
            }));

            juegos = juegos.concat(juegosConModoConocido);
            offset += limit;
        }

        return juegos;
    } catch (error) {
        console.error('Error al obtener la lista de juegos:', error.response ? error.response.data : error.message);
        return [];
    }
}

module.exports = obtenerListaJuegos;