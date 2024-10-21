const axios = require('axios');
const https = require('https');
const { formula1 } = require('../sequelize/models'); 
const sequelize = require('../sequelize/sequelize');
sequelize.sync();
module.exports = () => {
    let jugadorAleatorio;
    let intentos = 0;

    async function obtenerListaJugadores() {
        try {
            let jugadores = await formula1.findAll({
                order: sequelize.random(),
                limit: 10,
            });
 
            if (jugadores.length === 0) {
                throw new Error('No se encontraron jugadores.');
            }

            let jugadorRandomIndex = Math.floor(Math.random() * jugadores.length);
            console.log(jugadores[jugadorRandomIndex]);
            return jugadores[jugadorRandomIndex];
        } catch (error) {
            console.error('Error al obtener la lista de jugadores:', error.message);
            return null;
        }
    }

    async function obtenerJugadorSolicitado(jugador) {
        try {
            let jugadorElegido = await basquet.findOne({
                where: { nombre: jugador }
            });
            return jugadorElegido;
        } catch (error) {
            console.error('Error al obtener el jugador solicitado:', error.message);
            return null;
        }
    }

    async function iniciarJuegoFormula1(req, res) {
        jugadorAleatorio = await obtenerListaJugadores();

        if (!jugadorAleatorio) {
            return res.status(500).json({ error: 'No se pudo obtener un jugador aleatorio.' });
        }
        console.log(jugadorAleatorio);
        
        intentos = 0;

        res.json({
            message: 'Jugador aleatorio generado. ¡Adivina el jugador!',
        });
    }

    async function adivinarJugadorFormula1(req, res) {
        if (intentos >= 5) {
            return res.json({ message: `Perdiste! El jugador era: ${jugadorAleatorio.nombre} ${jugadorAleatorio.apellido}` });
            }
        const jugador = req.body.nombre;   
        console.log(jugador);
        let jugadorElegido = await obtenerJugadorSolicitado(jugador);
        console.log(jugadorElegido);

        if (!jugadorElegido) {
            return res.json({ error: 'Jugador no encontrado.' });
        }

        let coincidenciaNombre = jugadorElegido.nombre === jugadorAleatorio.nombre;
        let coincidenciaApellido = jugadorElegido.apellido === jugadorAleatorio.apellido;
        let coincidenciaNacionalidad = jugadorElegido.nacionalidad === jugadorAleatorio.nacionalidad;
        let coincidenciaNacimiento = jugadorElegido.fechaNacimiento === jugadorAleatorio.fechaNacimiento;
        let coincidenciaNumero = jugadorElegido.numero === jugadorAleatorio.numero;



        if (jugadorAleatorio.nombreCompleto === jugadorElegido.nombreCompleto) {
            return res.json({ message: '¡Ganaste!' });
        } else {
            intentos++;
            let resultadoNombre = coincidenciaNombre ? 'Verde' : 'Rojo';
            let resultadoApellido = coincidenciaApellido ? 'Verde' : 'Rojo';
            let resultadoNacionalidad = coincidenciaNacionalidad ? 'Verde' : 'Rojo';
            let resultadoNacimiento = coincidenciaNacimiento ? 'Verde' : 'Rojo';
            let resultadoNumero = coincidenciaNumero ? 'Verde' : 'Rojo';

            if (intentos >= 5) {
                return res.json({ message: `Perdiste! El jugador era: ${jugadorAleatorio.nombre}` });
            } else {
                res.json({
                    nombre: resultadoNombre,
                    apellido :  resultadoApellido,
                    nacionalidad: resultadoNacionalidad,
                    nacimiento: resultadoNacimiento,
                    numero: resultadoNumero,
                    intentos
                });
            }
        }
    }

    return { iniciarJuegoFormula1, adivinarJugadorFormula1 };
};
