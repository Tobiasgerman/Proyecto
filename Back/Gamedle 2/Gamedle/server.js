const axios = require('axios');
const https = require('https');
const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Sequelize } = require('sequelize');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const { Paises} = require('./sequelize/models');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const sequelize = new Sequelize('MultiWordle', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
});

const { iniciarJuegoBasquet, adivinarJugadorBasquet } = require('./basquet/app')(sequelize);
const {iniciarJuegoFormula1, adivinarJugadorFormula1} = require('./formula1/app')(sequelize);
const {paisAleatorio, paises} = require('./Mundle/app')(sequelize);

app.post('/iniciarJuegoBasquet', iniciarJuegoBasquet);
app.post('/adivinarJugadorBasquet', adivinarJugadorBasquet);
app.post('/iniciarJuegoFormula1', iniciarJuegoFormula1);
app.post('/adivinarJugadorFormula1', adivinarJugadorFormula1);
app.post('/distancia' , async (req, res) => {
    const { paisElegido, paisAleatorio } = req.body;
    try {
        const resultado = await obtenerDatos(paisElegido, paisAleatorio);
        res.json(resultado);
    } catch (error) {
        res.status(500).send(error.message);
    }});

app.get('/paises', paises);
app.get('/pais-aleatorio', paisAleatorio);


async function obtenerCoordenadas(paisNombre) {
    const pais = await Paises.findOne({ where: { nombre: paisNombre } });
    if (pais) {
        return { latitude: pais.latitud, longitude: pais.longitud };
    } else {
        console.log("País no encontrado");
    }
}

function calcularDistancia(origen, destino) {
    return geolib.getDistance(origen, destino) / 1000;
}

function calcularDireccion(origen, destino) {
    return geolib.getCompassDirection(origen, destino);
}

function generarPaisAleatorio(paises) {
    return paises[Math.floor(Math.random() * paises.length)];
}

async function obtenerDistanciaEntrePaises(paisElegido, paisAleatorio) {
    const origen = await obtenerCoordenadas(paisElegido.nombre);
    const destino = await obtenerCoordenadas(paisAleatorio.nombre);
    const distancia = calcularDistancia(origen, destino);
    const direccion = calcularDireccion(origen, destino);
    return { origen, destino, distancia: Math.round(distancia), direccion };
}

async function obtenerDatos(paisElegido, paisAleatorio) {
    let resultado = await obtenerDistanciaEntrePaises(paisElegido, paisAleatorio);
    return { distancia: resultado.distancia, direccion: puntosCardinales[resultado.direccion] };
}


io.on('connection', (socket) => {
    console.log('Client connected: ' + socket.id);

    socket.on('autocomplete', async (query, gamedle) => {
        console.log('Autocompletando:', query);
        try {
            let respuesta;  
            if(gamedle == 'basquet' || gamedle =='futbol' || gamedle == 'tennis' || gamedle =='formula1' ||  gamedle == 'celebridades'){
                if(gamedle == 'basquet'){
                    respuesta = await sequelize.query(
                    `SELECT nombre FROM ${gamedle} WHERE nombre LIKE '${query}%' LIMIT 10`,
                );
                } else {
                    respuesta = await sequelize.query(
                        `SELECT nombreCompleto FROM ${gamedle} WHERE nombreCompleto LIKE '${query}%' LIMIT 10`,
                    );
                }
                respuesta = respuesta[0].map(item => item.nombre);

            console.log(respuesta);
            socket.emit('suggestions', respuesta);
        } else{
            socket.emit('autocompleteError', 'Error');
        }
        } catch (error) {
            console.error('Error retrieving autocomplete results:', error);
            socket.emit('autocompleteError', error.message);
        }
    
    });
    socket.on('autocompleteMundle', async (query) => {
        console.log('Autocompletando:', query);
        try {
            let respuesta = await Paises.findAll({
                where: {
                  nombre: {
                    [Sequelize.Op.like]: `${query}%`
                  }
                },
                limit: 10,
                attributes: ['nombre']
              });
            respuesta  = respuesta.map(item => item.nombre) ;

            socket.emit('suggestions', respuesta);
        } catch (error) {
            console.error('Error retrieving autocomplete results:', error);
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
