const { Futbol } = require('../sequelize/models'); // Asegúrate de que la ruta al modelo sea correcta
const sequelize = require('../sequelize/sequelize');
sequelize.sync();
module.exports = () => {
    let jugadorAleatorio;
    let intentos = 0;

    async function obtenerListaJugadores() {
        try {
            let jugadores = await Futbol.findAll({
                order: sequelize.random(),
                limit: 10,
            });

            if (jugadores.length === 0) {
                throw new Error('No se encontraron jugadores.');
            }

            let jugadorRandomIndex = Math.floor(Math.random() * jugadores.length);
            console.log(jugadores[jugadorRandomIndex].nombre)
            return jugadores[jugadorRandomIndex];
        } catch (error) {
            console.error('Error al obtener la lista de jugadores:', error.message);
            return null;
        }
    }

    async function obtenerJugadorSolicitado(jugador) {
        try {
            let jugadorElegido = await Futbol.findOne({
                where: { nombre: jugador }
            });
            return jugadorElegido;
        } catch (error) {
            console.error('Error al obtener el jugador solicitado:', error.message);
            return null;
        }
    }

    async function iniciarJuegoFutbol(req, res) {
        jugadorAleatorio = await obtenerListaJugadores();
        console.log(jugadorAleatorio.nombre);

        if (!jugadorAleatorio) {
            return res.status(500).json({ error: 'No se pudo obtener un jugador aleatorio.' });
        }
    
        intentos = 0;

        res.json({
            message: 'Jugador aleatorio generado. ¡Adivina el jugador!',
        });
    }

    async function adivinarJugadorFutbol(req, res) {
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
        let coincidenciaNacionalidad = jugadorElegido.nacionalidad === jugadorAleatorio.nacionalidad;
        let coincidenciaFechaNacimiento = jugadorElegido.fechaNacimiento === jugadorAleatorio.fechaNacimiento;
        let coincidenciaPosicion = jugadorElegido.posicion === jugadorAleatorio.posicion;
        let nacimientoMayor = jugadorElegido.fechaNacimiento >= jugadorAleatorio.fechaNacimiento ?  true : false;


        if (jugadorElegido.nombre === jugadorAleatorio.nombre) {
            return res.json({ message: `Ganaste el jugador Aleatorio era ${jugadorAleatorio.nombre}`,
                nombre: "Verde",
                nacionalidad: "Verde", 
                nacimiento : "Verde",
                posicion: "Verde",
                nacimientoMayor : "Verde",
                intentos

     });


        } else {
            intentos++;
            let resultadoNombre = 'Rojo';
            let resultadoNacionalidad = coincidenciaNacionalidad ? 'Verde' : 'Rojo';
            let resultadoNacimiento = coincidenciaFechaNacimiento ? 'Verde' : 'Rojo';
            let resultadoPosicion = coincidenciaPosicion ? 'Verde' : 'Rojo';


            if (intentos >= 5) {
                return res.json({ message: `Perdiste! El jugador era: ${jugadorAleatorio.nombre}` });
            } else {
                res.json({
                    nombre: resultadoNombre,
                    nacionalidad: resultadoNacionalidad, 
                    nacimiento : resultadoNacimiento,
                    posicion: resultadoPosicion,
                    nacimientoMayor : nacimientoMayor,
                    intentos
                });
            }
        }
    }

    return { iniciarJuegoFutbol, adivinarJugadorFutbol };
};
