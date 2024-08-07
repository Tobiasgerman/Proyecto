const axios = require('axios');
const https = require('https');
const geolib = require('geolib');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function obtenerLista() {
    let url = 'https://restcountries.com/v3.1/all';

    try {
        let response = await axios.get(url, { httpsAgent });
        let paisesEsp = response.data.filter(p => p.translations && p.translations.spa);
        return paisesEsp;
    } catch (error) {
        throw new Error(`Error: ${error.message}`);
    }
}

async function obtenerCoordenadas(paisNombre, paises) {
    let pais = paises.find(p => p.name.common === paisNombre);
    if (pais) {
        const { latlng } = pais;
        return { latitude: latlng[0], longitude: latlng[1] };
    } else {
        throw new Error(`No se encontraron coordenadas para ${paisNombre}`);
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
    let destino = await obtenerCoordenadas(paisAleatorio.name.common, paises);
    let distancia = calcularDistancia(origen, destino);
    let direccion = calcularDireccion(origen, destino);
    distancia = Math.round(distancia);
    return { origen, destino, distancia, direccion };
}

async function obtenerDatos(paisElegido, paises, paisAleatorio) {
    let resultado = await obtenerDistanciaEntrePaises(paises, paisElegido, paisAleatorio);
    return { distancia: resultado.distancia, direccion: resultado.direccion };
}

async function main() {
    let intentos = 0;
    let paises = await obtenerLista();
    let paisAleatorio = generarPaisAleatorio(paises);

    const jugar = async () => {
        if (intentos >= 5) {
            console.log(`Superaste los 5 intentos, la respuesta correcta era ${paisAleatorio.name.common}`);
            rl.close();
            return;
        }

        rl.question('Elige un país: ', async (paisElegido) => {
            if (paisElegido === paisAleatorio.name.common) {
                console.log(`¡Ganaste! El país era ${paisAleatorio.name.common}`);
                rl.close();
                return;
            } else {
                try {
                    let resultado = await obtenerDatos(paisElegido, paises, paisAleatorio);
                    console.log(`El país aleatorio está a ${resultado.distancia} km y se encuentra en dirección ${resultado.direccion}`);
                } catch (error) {
                    console.log(error.message);
                }

                intentos++;
                console.log(`Vas ${intentos} / 5`);
                jugar();
            }
        });
    };

    jugar();
}

main();
