const axios = require('axios');
const https = require('https');
const express = require('express');
const cors = require('cors');
const sequelize = require('./sequelize');
const { Op } = require('sequelize');


const Juego = require('./models/Juego');
const Plataforma = require('./models/Plataforma');
const Genero = require('./models/Genero');
const Tema = require('./models/Tema');
const ModoJuego = require('./models/ModoJuego');
const PerspectivaJugador = require('./models/PerspectivaJugador');
const EmpresaInvolucrada = require('./models/EmpresaInvolucrada');
const MotorJuego = require('./models/MotorJuego');


require('./relations');

require('dotenv').config();

const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN;
const IGDB_API_URL = 'https://api.igdb.com/v4/games';
const POPULARITY_API_URL = 'https://api.igdb.com/v4/popularity_primitives';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const app = express();
app.use(express.json());
app.use(cors());

let juegoAleatorio;
let intentos = 0;


async function obtenerListaJuegos(modoConocido) {
    try {
        const totalJuegos = await Juego.count({ where: { modoConocido: modoConocido } });

        if (totalJuegos === 0) {
            throw new Error(`No se encontraron juegos ${modoConocido ? 'conocidos' : 'no conocidos'}.`);
        }

        const juegos = await Juego.findAll({
            where: { modoConocido: modoConocido },
            limit: 100 
        });

        if (juegos.length === 0) {
            throw new Error(`No se encontraron juegos ${modoConocido ? 'conocidos' : 'no conocidos'}.`);
        }

        let juegoRandomIndex = Math.floor(Math.random() * juegos.length);
        console.log(JSON.stringify(juegos[juegoRandomIndex]));
        return juegos[juegoRandomIndex];
    } catch (error) {
        console.error('Error al obtener la página aleatoria de juegos:', error.message);
    }
}

async function obtenerJuegoSolicitado(juegoNombre) {
    try {
        const juego = await Juego.findOne({
            where: {
                nombre: {
                    [Op.like]: `%${juegoNombre}%` // 
                }
            },
            include: [
                { model: Plataforma, as: 'plataformas' },
                { model: Genero, as: 'generos' },
                { model: Tema, as: 'temas' },
                { model: ModoJuego, as: 'modosJuego' },
                { model: PerspectivaJugador, as: 'perspectivasJugador' },
                { model: EmpresaInvolucrada, as: 'empresasInvolucradas' },
                { model: MotorJuego, as: 'motoresJuego' }
            ]
        });

        if (!juego) {
            return console.log('Juego no encontrado en la base de datos.');
        }

        console.log(JSON.stringify(juego, null, 7));
        return juego;
    } catch (error) {
        console.error('Error al obtener el juego solicitado de la base de datos:', error.message);
    }
}

app.post('/iniciarJuego', async (req, res) => {
    await sequelize.sync({ alter: true });
    const { modoConocido } = req.body; 
    let juegoAleatorioNombre = await obtenerListaJuegos(modoConocido);
    juegoAleatorio = await obtenerJuegoSolicitado(juegoAleatorioNombre.nombre);

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
        return res.json({ message: `Perdiste! El juego era: ${juegoAleatorio.nombre}` });
    }

    const { juego } = req.body;
    let juegoElegido = await obtenerJuegoSolicitado(juego);

    if (!juegoElegido) {
        return res.json({ error: 'Juego no encontrado.' });
    }

    let plataformaAleatoria = juegoAleatorio.plataformas ? juegoAleatorio.plataformas.map(platform => platform.name) : [];
    let generosAleatorio = juegoAleatorio.generos ? juegoAleatorio.generos.map(genre => genre.name) : [];
    let temasAleatorios = juegoAleatorio.temas ? juegoAleatorio.temas.map(theme => theme.name) : [];
    let modosDeJuegoAleatorios = juegoAleatorio.modosJuego ? juegoAleatorio.modosJuego.map(mode => mode.name) : [];
    let perspectivasAleatorias = juegoAleatorio.perspectivasJugador ? juegoAleatorio.perspectivasJugador.map(perspective => perspective.name) : [];
    let fechaLanzamientoAleatoria = juegoAleatorio.first_release_date ? new Date(juegoAleatorio.first_release_date * 1000).getFullYear() : 'Desconocido';
    let desarrolladoresAleatorios = juegoAleatorio.empresasInvolucradas ? juegoAleatorio.empresasInvolucradas.map(company => company.company.nombre) : [];
    let motorAleatorio = juegoAleatorio.motoresJuego ? juegoAleatorio.motoresJuego.map(engine => engine.name) : [];

    let plataformaElegida = juegoElegido.plataformas ? juegoElegido.plataformas.map(platform => platform.name) : [];
    let generosElegido = juegoElegido.generos ? juegoElegido.generos.map(genre => genre.name) : [];
    let temasElegido = juegoElegido.temas ? juegoElegido.temas.map(theme => theme.name) : [];
    let modosDeJuegoElegido = juegoElegido.modosJuego ? juegoElegido.modosJuego.map(mode => mode.name) : [];
    let perspectivasElegido = juegoElegido.perspectivasJugador ? juegoElegido.perspectivasJugador.map(perspective => perspective.name) : [];
    let fechaLanzamientoElegida = juegoElegido.first_release_date ? new Date(juegoElegido.first_release_date * 1000).getFullYear() : 'Desconocido';
    let desarrolladoresElegidos = juegoElegido.empresasInvolucradas ? juegoElegido.empresasInvolucradas.map(company => company.company.name) : [];
    let motorElegido = juegoElegido.motoresJuego ? juegoElegido.motoresJuego.map(engine => engine.name) : [];

    if (juegoElegido.nombre === juegoAleatorio.nombre) {
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
            ? (coincidenciaGeneros.length === generosElegido.length ? 'Verde' : coincidenciaGeneros.length > 0 ? 'Amarillo' : 'Rojo')
            : 'Rojo';

        let resultadoPlataforma = plataformaElegida.length > 0
            ? (coincidenciaPlataforma.length === plataformaElegida.length ? 'Verde' : coincidenciaPlataforma.length > 0 ? 'Amarillo' : 'Rojo')
            : 'Rojo';

        let resultadoTemas = temasElegido.length > 0
            ? (coincidenciaTemas.length === temasElegido.length ? 'Verde' : coincidenciaTemas.length > 0 ? 'Amarillo' : 'Rojo')
            : 'Rojo';

        let resultadoModosDeJuego = modosDeJuegoElegido.length > 0
            ? (coincidenciaModosDeJuego.length === modosDeJuegoElegido.length ? 'Verde' : coincidenciaModosDeJuego.length > 0 ? 'Amarillo' : 'Rojo')
            : 'Rojo';

        let resultadoPerspectivas = perspectivasElegido.length > 0
            ? (coincidenciaPerspectivas.length === perspectivasElegido.length ? 'Verde' : coincidenciaPerspectivas.length > 0 ? 'Amarillo' : 'Rojo')
            : 'Rojo';

        let resultadoFechaLanzamiento = coincidenciaFechaLanzamiento ? 'Verde' : 'Rojo';
        let resultadoDesarrolladores = desarrolladoresElegidos.length > 0
            ? (coincidenciaDesarrolladores.length === desarrolladoresElegidos.length ? 'Verde' : coincidenciaDesarrolladores.length > 0 ? 'Amarillo' : 'Rojo')
            : 'Rojo';

        let resultadoMotor = motorElegido.length > 0
            ? (coincidenciaMotor.length === motorElegido.length ? 'Verde' : coincidenciaMotor.length > 0 ? 'Amarillo' : 'Rojo')
            : 'Rojo';

        intentos++;

        res.json({
            mensaje: 'Sigue intentándolo.',
            resultadoGenero,
            resultadoPlataforma,
            resultadoTemas,
            resultadoModosDeJuego,
            resultadoPerspectivas,
            resultadoFechaLanzamiento,
            resultadoDesarrolladores,
            resultadoMotor
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
