const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const dotenv = require('dotenv');
const Juego = require('../models/Juego');
dotenv.config();

const POPULARITY_API_URL = 'https://api.igdb.com/v4/popularity_primitives';
const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN;

async function obtenerJuegosPopulares() {
    try {
        // Obtener IDs de juegos populares usando el endpoint de popularidad
        const popularQuery = `fields game_id; where popularity_source = 118; sort value desc; limit 100;`;
        const popularResponse = await axios.post(
            POPULARITY_API_URL,
            popularQuery,
            {
                headers: {
                    'Client-ID': CLIENT_ID,
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'text/plain'
                },
                httpsAgent
            }
        );

        const popularGameIds = popularResponse.data.map(game => game.game_id);
        console.log(`Se obtuvieron ${popularGameIds.length} IDs de juegos populares.`);
        return popularGameIds;
    } catch (error) {
        console.error('Error al obtener juegos populares:', error.response ? error.response.data : error.message);
        return [];
    }
}

async function actualizarJuegosConocidos() {
    const popularGameIds = await obtenerJuegosPopulares();

    if (popularGameIds.length > 0) {
        try {
            // Actualizar los juegos en la base de datos para marcarlos como conocidos
            await Juego.update(
                { modoConocido: true },
                { where: { id: popularGameIds } }
            );
            console.log('Juegos populares actualizados como conocidos.');
        } catch (error) {
            console.error('Error al actualizar juegos conocidos:', error);
        }
    }
}

actualizarJuegosConocidos();