const axios = require('axios');
const https = require('https');
const geolib = require('geolib');
const express = require('express');
const  sequelize  = require('./Database/sequelize');
const { Paises, Usuarios } = require('./Database/models');
const cors = require('cors');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const readline = require('node:readline');

sequelize.sync({alter: false});
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

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

async function obtenerLista() {
    return await Paises.findAll();
}

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
    const origen = await obtenerCoordenadas(paisElegido);
    const destino = await obtenerCoordenadas(paisAleatorio.nombre);
    const distancia = calcularDistancia(origen, destino);
    const direccion = calcularDireccion(origen, destino);
    return { origen, destino, distancia: Math.round(distancia), direccion };
}

async function obtenerDatos(paisElegido, paisAleatorio) {
    let resultado = await obtenerDistanciaEntrePaises(paisElegido, paisAleatorio);
    return { distancia: resultado.distancia, direccion: puntosCardinales[resultado.direccion] };
}

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

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
        const resultado = await obtenerDatos(paisElegido, paisAleatorio);
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

app.listen(port, () => {
    console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
