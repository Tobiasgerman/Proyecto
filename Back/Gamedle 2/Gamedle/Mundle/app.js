const geolib = require('geolib');
const  sequelize  = require('../sequelize/sequelize');
const { Paises} = require('../sequelize/models');
module.exports = () => {

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


async function paises(req, res) {
    try {
        const paises = await obtenerLista();
        res.json(paises);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

async function distancia(req, res) {

    const { paisElegido, paisAleatorio } = req.body;
    console.log(paisElegido, paisAleatorio);

    try {
        const resultado = await obtenerDatos(paisElegido, paisAleatorio);
        console.log(resultado);
        
        res.json(resultado);
        console.log("resultado enviado");
    } catch (error) {
        res.status(500).send(error.message);
    }
};


async function paisAleatorio(req, res) {
    try {
        const paises = await obtenerLista();
        const paisAleatorio = generarPaisAleatorio(paises);
        
        res.json(paisAleatorio);
    } catch (error) {
        res.status(500).send(error.message);
    }
    }
    return {paisAleatorio, distancia, paises};
};
