const axios = require('axios');
const https = require('https');
const { Basquet } = require('../sequelize/models'); // Asegúrate de que la ruta al modelo sea correcta
const sequelize = require('../sequelize/sequelize');
module.exports = () => {
    let jugadorAleatorio;
    let intentos = 0;

    async function obtenerListaJugadores() {
        try {
            let jugadores = await Basquet.findAll({
                order: sequelize.random(),
                limit: 10,
            });

            if (jugadores.length === 0) {
                throw new Error('No se encontraron jugadores.');
            }

            let jugadorRandomIndex = Math.floor(Math.random() * jugadores.length);
            console.log(jugadores[jugadorRandomIndex].nombre);
            return jugadores[jugadorRandomIndex];
        } catch (error) {
            console.error('Error al obtener la lista de jugadores:', error.message);
            return null;
        }
    }

    async function obtenerJugadorSolicitado(jugador) {
        try {
            let jugadorElegido = await Basquet.findOne({
                where: { nombre: jugador }
            });
            return jugadorElegido;
        } catch (error) {
            console.error('Error al obtener el jugador solicitado:', error.message);
            return null;
        }
    }

    async function iniciarJuegoBasquet(req, res) {
        jugadorAleatorio = await obtenerListaJugadores();

        if (!jugadorAleatorio) {
            return res.status(500).json({ error: 'No se pudo obtener un jugador aleatorio.' });
        }
        
        intentos = 0;

        res.json({
            message: 'Jugador aleatorio generado. ¡Adivina el jugador!',
        });
    }

    async function adivinarJugadorBasquet(req, res) {
        if (intentos >= 5) {
            return res.json({ message: `Perdiste! El jugador era: ${jugadorAleatorio.nombre}` });
            }

        const jugador = req.body.nombre;   
        console.log(jugador);
        let jugadorElegido = await obtenerJugadorSolicitado(jugador);
        console.log(jugadorElegido);

        if (!jugadorElegido) {
            return res.json({ error: 'Jugador no encontrado.' });
        }
        let coincidenciaPais = jugadorElegido.pais === jugadorAleatorio.pais;
        let coincidenciaEquipo = jugadorElegido.equipo === jugadorAleatorio.equipo;
        let coincidenciaCamiseta = jugadorElegido.camiseta === jugadorAleatorio.camiseta;

        if (jugadorElegido.nombre === jugadorAleatorio.nombre) {
            return res.json({ message: '¡Ganaste!' });
        } else {
            intentos++;
            let resultadoNombre = 'Rojo';
            let resultadoPais = coincidenciaPais ? 'Verde' : 'Rojo';
            let resultadoEquipo = coincidenciaEquipo ? 'Verde' : 'Rojo';
            let resultadoCamiseta = coincidenciaCamiseta ? 'Verde' : 'Rojo';
            console.log(resultadoEquipo);

            if (intentos >= 5) {
                return res.json({ message: `Perdiste! El jugador era: ${jugadorAleatorio.nombre}` });
            } else {
                res.json({
                    nombre: resultadoNombre,
                    pais: resultadoPais,
                    equipo: resultadoEquipo,
                    camiseta: resultadoCamiseta,
                    intentos
                });
            }
        }
    }

    return { iniciarJuegoBasquet, adivinarJugadorBasquet };
};