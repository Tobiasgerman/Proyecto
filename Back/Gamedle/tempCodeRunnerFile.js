const express = require('express');
const cors = require('cors');
const { sequelize, Juego, Plataforma, Genero, Tema, ModoJuego, PerspectivaJugador, Compania, MotorJuego } = require('./DatabaseConfig');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

let juegoAleatorio;
let intentos = 0;

async function obtenerJuegoAleatorio(modoConocido) {
    try {
        let juegos;
        if (modoConocido) {
            // Obtener juegos populares de la base de datos
            juegos = await Juego.findAll({
                include: [
                    { model: Plataforma, through: { attributes: [] } },
                    { model: Genero, through: { attributes: [] } },
                    { model: Tema, through: { attributes: [] } },
                    { model: ModoJuego, through: { attributes: [] } },
                    { model: PerspectivaJugador, through: { attributes: [] } },
                    { model: Compania, through: { attributes: [] } },
                    { model: MotorJuego, through: { attributes: [] } }
                ],
                limit: 100 // Ajusta según tu necesidad
            });
        } else {
            // Obtener juegos aleatorios
            juegos = await Juego.findAll({
                include: [
                    { model: Plataforma, through: { attributes: [] } },
                    { model: Genero, through: { attributes: [] } },
                    { model: Tema, through: { attributes: [] } },
                    { model: ModoJuego, through: { attributes: [] } },
                    { model: PerspectivaJugador, through: { attributes: [] } },
                    { model: Compania, through: { attributes: [] } },
                    { model: MotorJuego, through: { attributes: [] } }
                ],
                offset: Math.floor(Math.random() * 1000),
                limit: 10
            });
        }

        if (juegos.length === 0) {
            throw new Error('No se encontraron juegos.');
        }

        let juegoRandomIndex = Math.floor(Math.random() * juegos.length);
        return juegos[juegoRandomIndex];
    } catch (error) {
        console.error('Error al obtener el juego aleatorio:', error);
        return null;
    }
}

async function obtenerJuegoPorNombre(nombre) {
    try {
        const juego = await Juego.findOne({
            where: { nombre },
            include: [
                { model: Plataforma, through: { attributes: [] } },
                { model: Genero, through: { attributes: [] } },
                { model: Tema, through: { attributes: [] } },
                { model: ModoJuego, through: { attributes: [] } },
                { model: PerspectivaJugador, through: { attributes: [] } },
                { model: Compania, through: { attributes: [] } },
                { model: MotorJuego, through: { attributes: [] } }
            ]
        });
        return juego;
    } catch (error) {
        console.error('Error al obtener el juego solicitado:', error);
        return null;
    }
}

app.post('/iniciarJuego', async (req, res) => {
    const { modoConocido } = req.body; // Recibe la opción del modo de juego
    juegoAleatorio = await obtenerJuegoAleatorio(modoConocido);

    if (!juegoAleatorio) {
        return res.status(500).json({ error: 'No se pudo obtener un juego aleatorio.' });
    }

    intentos = 0; // Reiniciar intentos al iniciar un nuevo juego

    res.json({
        message: 'Juego aleatorio generado. ¡Adivina el juego!',
    });
});

app.post('/adivinarJuego', async (req, res) => {
    if (intentos >= 5) {
        return res.json({ message: `Perdiste! El juego era: ${juegoAleatorio.nombre}` });
    }

    const { nombreJuego } = req.body;
    let juegoElegido = await obtenerJuegoPorNombre(nombreJuego);

    if (!juegoElegido) {
        return res.json({ error: 'Juego no encontrado.' });
    }

    let plataformaAleatoria = juegoAleatorio.Plataformas.map(plataforma => plataforma.nombre);
    let generosAleatorio = juegoAleatorio.Generos.map(genero => genero.nombre);
    let temasAleatorios = juegoAleatorio.Temas.map(tema => tema.nombre);
    let modosDeJuegoAleatorios = juegoAleatorio.ModoJuegos.map(modoJuego => modoJuego.nombre);
    let perspectivasAleatorias = juegoAleatorio.PerspectivasJugadors.map(perspectiva => perspectiva.nombre);
    let fechaLanzamientoAleatoria = new Date(juegoAleatorio.fecha_lanzamiento * 1000).getFullYear();
    let desarrolladoresAleatorios = juegoAleatorio.Companias.map(compania => compania.nombre);
    let motorAleatorio = juegoAleatorio.MotoresJuegos.map(motor => motor.nombre);

    let plataformaElegida = juegoElegido.Plataformas.map(plataforma => plataforma.nombre);
    let generosElegido = juegoElegido.Generos.map(genero => genero.nombre);
    let temasElegido = juegoElegido.Temas.map(tema => tema.nombre);
    let modosDeJuegoElegido = juegoElegido.ModoJuegos.map(modoJuego => modoJuego.nombre);
    let perspectivasElegido = juegoElegido.PerspectivasJugadors.map(perspectiva => perspectiva.nombre);
    let fechaLanzamientoElegida = new Date(juegoElegido.fecha_lanzamiento * 1000).getFullYear();
    let desarrolladoresElegidos = juegoElegido.Companias.map(compania => compania.nombre);
    let motorElegido = juegoElegido.MotoresJuegos.map(motor => motor.nombre);

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
            return res.json({ message: `Perdiste! El juego era: ${juegoAleatorio.nombre}` });
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

app.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});
