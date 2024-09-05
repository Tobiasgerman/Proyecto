const axios = require('axios');
const Juego = require('../models/Juego');
const Plataforma = require('../models/Plataforma');
const Genero = require('../models/Genero');
const Tema = require('../models/Tema');
const ModoJuego = require('../models/ModoJuego');
const PerspectivaJugador = require('../models/PerspectivaJugador');
const EmpresaInvolucrada = require('../models/EmpresaInvolucrada');
const MotorJuego = require('../models/MotorJuego');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const dotenv = require('dotenv');
dotenv.config();

async function guardarJuego(juego, modoConocido) {
    try {
        const juegoGuardado = await Juego.create({
            id: juego.id,
            nombre: juego.name,
            fechaLanzamiento: juego.first_release_date ? new Date(juego.first_release_date * 1000) : null,
            modoConocido: modoConocido,
        });

        if (juego.platforms) {
            for (let platform of juego.platforms) {
                let [plataformaGuardada] = await Plataforma.findOrCreate({ where: { id: platform.id, nombre: platform.name } });
                await juegoGuardado.addPlataforma(plataformaGuardada);
            }
        }

        if (juego.genres) {
            for (let genre of juego.genres) {
                let [generoGuardado] = await Genero.findOrCreate({ where: { id: genre.id, nombre: genre.name } });
                await juegoGuardado.addGenero(generoGuardado);
            }
        }

        if (juego.themes) {
            for (let theme of juego.themes) {
                let [temaGuardado] = await Tema.findOrCreate({ where: { id: theme.id, nombre: theme.name } });
                await juegoGuardado.addTema(temaGuardado);
            }
        }

        if (juego.game_modes) {
            for (let mode of juego.game_modes) {
                let [modoJuegoGuardado] = await ModoJuego.findOrCreate({ where: { id: mode.id, nombre: mode.name } });
                await juegoGuardado.addModoJuego(modoJuegoGuardado);
            }
        }

        if (juego.player_perspectives) {
            for (let perspective of juego.player_perspectives) {
                let [perspectivaGuardada] = await PerspectivaJugador.findOrCreate({ where: { id: perspective.id, nombre: perspective.name } });
                await juegoGuardado.addPerspectivaJugador(perspectivaGuardada);
            }
        }

        if (juego.involved_companies) {
            for (let company of juego.involved_companies) {
                let [empresaGuardada] = await EmpresaInvolucrada.findOrCreate({ where: { id: company.company.id, nombre: company.company.name } });
                await juegoGuardado.addEmpresaInvolucrada(empresaGuardada);
            }
        }

        if (juego.game_engines) {
            for (let engine of juego.game_engines) {
                let [motorGuardado] = await MotorJuego.findOrCreate({ where: { id: engine.id, nombre: engine.name } });
                await juegoGuardado.addMotorJuego(motorGuardado);
            }
        }

        return juegoGuardado;

    } catch (error) {
        console.error('Error al guardar el juego:', error);
    }
}

async function procesarJuegos(juegos) {
    for (const juego of juegos) {
        await guardarJuego(juego, juego.modoConocido);
    }
}

module.exports = {
    procesarJuegos
};