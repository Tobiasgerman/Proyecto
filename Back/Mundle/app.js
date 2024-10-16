const axios = require('axios');
const https = require('https');
const geolib = require('geolib');
const http = require('http');
const express = require('express');
<<<<<<< HEAD
=======
const socketio = require('socket.io');
const  sequelize  = require('./Database/sequelize');
const { Paises, Usuarios } = require('./Database/models');
>>>>>>> 6e61083fa9a8828a2415fd2b94be8f940055bb0e
const cors = require('cors');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const readline = require('node:readline');
const { Sequelize } = require('sequelize');





const puntosCardinales = {
    "N": "Norte",
    "NNE": "Noreste",
    "NE": "Noreste",
    "ENE": "Este",
    "E": "Este",
    "ESE": "Sureste",
    "SE": "Sureste",
    "SSE": "Sureste",
    "S": "Sur",
    "SSW": "Suroeste",
    "SW": "Suroeste",
    "WSW": "Suroeste",
    "W": "Oeste",
    "WNW": "Noroeste",
    "NW": "Noroeste",
    "NNW": "Noroeste"
};

const app = express();
const port = 3000;

app.use(cors()); // Permite solicitudes desde cualquier origen
app.use(express.json());


<<<<<<< HEAD
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
=======
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
});



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
>>>>>>> 6e61083fa9a8828a2415fd2b94be8f940055bb0e
});

async function obtenerLista() {
    let url = 'https://restcountries.com/v3.1/all';

    try {
        let response = await axios.get(url, { httpsAgent });
        let paisesEsp = response.data.filter(p => p.translations && p.translations.spa);
        return paisesEsp;
    } catch (error) {
        console.log(error.message);
    }
}

async function obtenerCoordenadas(paisNombre, paises) {
    let pais = paises.find(p => p.translations.spa.common === paisNombre);
    if (pais) {
        const { latlng } = pais;
        return { latitude: latlng[0], longitude: latlng[1] };
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

async function obtenerDistanciaEntrePaises(paises, paisElegido, paisAleatorio) {
    let origen = await obtenerCoordenadas(paisElegido, paises);
    let destino = await obtenerCoordenadas(paisAleatorio.translations.spa.common, paises);
    let distancia = calcularDistancia(origen, destino);
    let direccion = calcularDireccion(origen, destino);
    distancia = Math.round(distancia);
    return { origen, destino, distancia, direccion };
}

async function obtenerDatos(paisElegido, paises, paisAleatorio) {
    let resultado = await obtenerDistanciaEntrePaises(paises, paisElegido, paisAleatorio);
    return { distancia: resultado.distancia, direccion: puntosCardinales[resultado.direccion] };
}

app.get('/paises', async (req, res) => {
    try {
        const paises = await obtenerLista();
        res.json(paises);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/distancia', async (req, res) => {
    const { paisElegido, paisAleatorio } = req.body;

    try {
        const paises = await obtenerLista();
        const resultado = await obtenerDatos(paisElegido, paises, paisAleatorio);
        res.json(resultado);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.get('/pais-aleatorio', async (req, res) => {
    try {
        const paises = await obtenerLista();
        const paisAleatorio = generarPaisAleatorio(paises);
        
        res.json(paisAleatorio);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

<<<<<<< HEAD
app.use(express.static('public'));

app.listen(port, () => {
=======

io.on('connection', (socket) => {
    console.log('Client connected: ' + socket.id);

    socket.on('autocomplete', async (query) => {
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

server.listen(port, () => {
>>>>>>> 6e61083fa9a8828a2415fd2b94be8f940055bb0e
    console.log(`Servidor backend escuchando en http://localhost:${port}`);
});