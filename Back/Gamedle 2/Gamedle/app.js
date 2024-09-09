const axios = require('axios');
const https = require('https');

const express = require('express');
const cors = require('cors');
const http = require('http');

const socketio = require('socket.io');
  require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
http.globalAgent.options.rejectUnauthorized = false;
https.globalAgent.options.rejectUnauthorized = false;
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
    });
const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN;
const IGDB_API_URL = 'https://api.igdb.com/v4/games';
const POPULARITY_API_URL = 'https://api.igdb.com/v4/popularity_primitives';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });


let juegoAleatorio;
let intentos = 0;

async function obtenerListaJuegos(modoConocido) {
    try {
        let gameIds = [];
        let query;

        if (modoConocido) {
            
            const popularQuery = `fields game_id; where popularity_source = 121; where popularity_source = 121; sort value desc; limit 100;`;
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

            gameIds = popularResponse.data.map(item => item.game_id);

            if (gameIds.length === 0) {
                throw new Error('No se encontraron juegos populares.');
            }

            query = `fields name, platforms.name, genres.name, themes.name, game_modes.name, first_release_date, release_dates.human, player_perspectives.name, involved_companies.company.name, game_engines.name; where id = (${gameIds.join(',')});`;
        } else {
            query = `fields name, platforms.name, genres.name, themes.name, game_modes.name, first_release_date, release_dates.human, player_perspectives.name, involved_companies.company.name, game_engines.name; limit 10; offset ${Math.floor(Math.random() * 1000)};`;
        }

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

        if (respuesta.data.length === 0) {
            throw new Error('No se encontraron juegos.');
        }

        let juegoRandomIndex = Math.floor(Math.random() * respuesta.data.length);
        console.log((respuesta.data[juegoRandomIndex]).name);
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
            `fields name, platforms.name, genres.name, themes.name, game_modes.name, first_release_date, release_dates.human, player_perspectives.name, involved_companies.company.name, game_engines.name; search "${juego}";`,
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

app.post('/iniciarJuego', async (req, res) => {
    const { modoConocido } = req.body; 
    juegoAleatorio = await obtenerListaJuegos(modoConocido);

    if (!juegoAleatorio) {
        return res.status(500).json({ error: 'No se pudo obtener un juego aleatorio.' });
    }
    

    intentos = 0;

    res.json({
        message: 'Juego aleatorio generado. ¡Adivina el juego!',
    });
});

app.post('/adivinarJuego', async (req, res) => {
    if (intentos >= 5) {
        return res.json({ message: `Perdiste! El juego era: ${juegoAleatorio.name}` });
    }

    const { juego } = req.body;
    let juegoElegido = await obtenerJuegoSolicitado(juego);

    if (!juegoElegido) {
        return res.json({ error: 'Juego no encontrado.' });
    }

    let plataformaAleatoria = juegoAleatorio.platforms ? juegoAleatorio.platforms.map(platform => platform.name) : [];
    let generosAleatorio = juegoAleatorio.genres ? juegoAleatorio.genres.map(genre => genre.name) : [];
    let temasAleatorios = juegoAleatorio.themes ? juegoAleatorio.themes.map(theme => theme.name) : [];
    let modosDeJuegoAleatorios = juegoAleatorio.game_modes ? juegoAleatorio.game_modes.map(mode => mode.name) : [];
    let perspectivasAleatorias = juegoAleatorio.player_perspectives ? juegoAleatorio.player_perspectives.map(perspective => perspective.name) : [];
    let fechaLanzamientoAleatoria = juegoAleatorio.first_release_date ? new Date(juegoAleatorio.first_release_date * 1000).getFullYear() : 'Desconocido';
    let desarrolladoresAleatorios = juegoAleatorio.involved_companies ? juegoAleatorio.involved_companies.map(company => company.company.name) : [];
    let motorAleatorio = juegoAleatorio.game_engines ? juegoAleatorio.game_engines.map(engine => engine.name) : [];

    let plataformaElegida = juegoElegido.platforms ? juegoElegido.platforms.map(platform => platform.name) : [];
    let generosElegido = juegoElegido.genres ? juegoElegido.genres.map(genre => genre.name) : [];
    let temasElegido = juegoElegido.themes ? juegoElegido.themes.map(theme => theme.name) : [];
    let modosDeJuegoElegido = juegoElegido.game_modes ? juegoElegido.game_modes.map(mode => mode.name) : [];
    let perspectivasElegido = juegoElegido.player_perspectives ? juegoElegido.player_perspectives.map(perspective => perspective.name) : [];
    let fechaLanzamientoElegida = juegoElegido.first_release_date ? new Date(juegoElegido.first_release_date * 1000).getFullYear() : 'Desconocido';
    let desarrolladoresElegidos = juegoElegido.involved_companies ? juegoElegido.involved_companies.map(company => company.company.name) : [];
    let motorElegido = juegoElegido.game_engines ? juegoElegido.game_engines.map(engine => engine.name) : [];

    if (juegoElegido.name === juegoAleatorio.name) {
        return res.json({ message: '¡Ganaste!' });
    } else {
        let coincidenciaGeneros = generosElegido.filter(category => generosAleatorio.includes(category));
        let coincidenciaPlataforma = plataformaElegida.filter(platform => plataformaAleatoria.includes(platform));
        let coincidenciaTemas = temasElegido.filter(theme => temasAleatorios.includes(theme));
        let coincidenciaModosDeJuego = modosDeJuegoElegido.filter(mode => modosDeJuegoAleatorios.includes(mode));
        let coincidenciaPerspectivas = perspectivasElegido.filter(perspective => perspectivasAleatorias.includes(perspective));
        let coincidenciaFechaLanzamiento = fechaLanzamientoElegida === fechaLanzamientoAleatoria;
        let coincidenciaDesarrolladores = desarrolladoresElegidos.filter(company => desarrolladoresAleatorios.includes(company));
        let coincidenciaMotor = motorElegido.filter(engine => motorAleatorio.includes(engine));

        let resultadoGenero = generosElegido.length > 0
            ? (coincidenciaGeneros.length === generosElegido.length ? 'Verde' : 'Amarillo')
            : 'Rojo';

        let resultadoPlataforma = plataformaElegida.length > 0
            ? (coincidenciaPlataforma.length === plataformaElegida.length ? 'Verde' : 'Amarillo')
            : 'Rojo';

        let resultadoTemas = temasElegido.length > 0
            ? (coincidenciaTemas.length === temasElegido.length ? 'Verde' : 'Amarillo')
            : 'Rojo';

        let resultadoModosDeJuego = modosDeJuegoElegido.length > 0
            ? (coincidenciaModosDeJuego.length === modosDeJuegoElegido.length ? 'Verde' : 'Amarillo')
            : 'Rojo';

        let resultadoPerspectivas = perspectivasElegido.length > 0
            ? (coincidenciaPerspectivas.length === perspectivasElegido.length ? 'Verde' : 'Amarillo')
            : 'Rojo';

        let resultadoFechaLanzamiento = coincidenciaFechaLanzamiento ? 'Verde' : 'Rojo';
        let resultadoDesarrolladores = desarrolladoresElegidos.length > 0
            ? (coincidenciaDesarrolladores.length === desarrolladoresElegidos.length ? 'Verde' : 'Amarillo')
            : 'Rojo';

        let resultadoMotor = motorElegido.length > 0
            ? (coincidenciaMotor.length === motorElegido.length ? 'Verde' : 'Amarillo')
            : 'Rojo';

        intentos++;

        if (intentos >= 5) {
            return res.json({ message: `Perdiste! El juego era: ${juegoAleatorio.name}` });
        } else {
            res.json({
                generos: resultadoGenero,
                plataformas: resultadoPlataforma,
                temas: resultadoTemas,
                modosDeJuego: resultadoModosDeJuego,
                perspectivas: resultadoPerspectivas,
                fechaLanzamiento: resultadoFechaLanzamiento,
                desarrolladores: resultadoDesarrolladores,
                motor: resultadoMotor,
                intentos
            });
        }
    }
});

io.on('connection', (socket) => {
    console.log('Client conected: ' + socket.id);

    socket.on('autocomplete', async (query) => {
        console.log('Autocompletando:', query);
        try {
            let respuesta = await axios.post(
                IGDB_API_URL,
                `fields name; search "${query}"; limit 10;`,
                {
                    headers: {
                        'Client-ID': CLIENT_ID,
                        'Authorization': `Bearer ${ACCESS_TOKEN}`,
                        'Content-Type': 'text/plain'
                    },
                    httpsAgent
                }
            );
            socket.emit('suggestions', respuesta.data);
        } catch (error) {
            console.error('Error al obtener los resultados de autocompletado:', error.response ? error.response.data : error.message);
            socket.emit('autocompleteError', error.message);
        }
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});
