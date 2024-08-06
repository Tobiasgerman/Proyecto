const axios = require ('axios');
const https = require ('https');
const geolib = require ('geolib');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });






async function obtenerLista () {
    let url = 'https://restcountries.com/v3.1/all';

    try {
        let response = await axios.get(url, { httpsAgent });
        let paisesEsp = response.data.filter(p => p.translations.spa);
        return paisesEsp;
      } catch (error) {
        throw new Error(`Error: ${error.message}`);
      }
}
async function obtenerCoordenadas (paisNombre, paises){
    let pais = paises.find(p => p.name.common === paisNombre);
    if (pais) {
        const { latlng } = pais;
        return { latitude: latlng[0], longitude: latlng[1] };
      } else {
        throw new Error(`No se encontraron coordenadas para ${paisNombre}`);
      }
}

function calcularDistancia (origen, destino){
    return geolib.getDistance(origen, destino) / 1000;
}
function calcularDireccion (origen, destino){
  return geolib.getCompassDirection(origen, destino);


}

function generarPaisAleatorio(paises){
    let paisAleatorio = paises[Math.floor(Math.random() * paises.length)];
    return paisAleatorio.name.common;
}
async function obtenerDistanciaEntrePaises(paises, paisElegido){
    let paisAleatorio = generarPaisAleatorio(paises);
    let origen = await obtenerCoordenadas(paisElegido, paises);
    let destino = await obtenerCoordenadas(paisAleatorio, paises);
    let distancia = calcularDistancia(origen, destino);
    let direccion = calcularDireccion(origen, destino);
    distancia = Math.round(distancia);
    return { origen, destino, distancia , paisAleatorio , direccion};
}
async function main(){
  try {
      let paises = await obtenerLista();
      let paisElegido = "Argentina"; // Placeholder
      let resultado = await obtenerDistanciaEntrePaises(paises, paisElegido);
      console.log(`La distancia entre ${paisElegido} y ${resultado.paisAleatorio} es de ${resultado.distancia} km`);
      console.log(`El pais se encuentra en direccion: ${resultado.direccion}`);
    } catch (error) {
      console.error(error.message);
    }
}

main();