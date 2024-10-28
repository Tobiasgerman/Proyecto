const axios = require('axios');
const { Futbol } = require('../sequelize/models');
const sequelize = require('../sequelize/sequelize');

// Configuración de la API
const API_URL = 'https://api.football-data.org/v4/';
const API_TOKEN = '20f15d7be30549db828caf69ed6a8258'; // Reemplaza con tu token de la API

// Función para esperar un tiempo determinado
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para obtener la lista de ligas
async function getLeagues() {
    try {
        const response = await axios.get(`${API_URL}competitions`, {
            headers: { 'X-Auth-Token': API_TOKEN }
        });
        return response.data.competitions;
    } catch (error) {
        if (error.response) {
            console.error('Error en la respuesta del servidor al obtener las ligas:', error.response.status);
            await wait(60000); // Esperar 1 minuto
            return getLeagues(); // Reintentar
        } else {
            console.error('Error al obtener las ligas:', error.message);
        }
        return [];
    }
}

// Función para obtener la lista de equipos de una liga
async function getTeams(leagueId) {
    try {
        const response = await axios.get(`${API_URL}competitions/${leagueId}/teams`, {
            headers: { 'X-Auth-Token': API_TOKEN }
        });
        return response.data.teams;
    } catch (error) {
        if (error.response) {
            console.error('Error en la respuesta del servidor al obtener los equipos:', error.response.status);
            await wait(60000); // Esperar 1 minuto
            return getTeams(leagueId); // Reintentar
        } else {
            console.error('Error al obtener los equipos:', error.message);
        }
        return [];
    }
}

// Función para obtener la lista de jugadores y guardarlos en la base de datos
async function getPlayers(teamId) {
    try {
        const response = await axios.get(`${API_URL}teams/${teamId}`, {
            headers: { 'X-Auth-Token': API_TOKEN }
        });

        const players = response.data.squad;
        for (const player of players) {
            await Futbol.create({
                nombre: player.name,
                nacionalidad: player.nationality,
                fechaNacimiento: player.dateOfBirth,
                posicion: player.position,
                numeroCamiseta: player.shirtNumber
            });
            console.log(`Guardado: ${player.name}`);
        }
    } catch (error) {
        if (error.response) {
            console.error('Error en la respuesta del servidor al obtener los jugadores:', error.response.status);
            await wait(60000); // Esperar 1 minuto
            return getPlayers(teamId); // Reintentar
        } else {
            console.error('Error al obtener los jugadores:', error.message);
        }
    }
}

// Función principal para obtener jugadores de todos los equipos de las ligas conocidas
async function getAllPlayers() {
    const leagues = await getLeagues();
    for (const league of leagues) {
        const teams = await getTeams(league.id);
        for (const team of teams) {
            await getPlayers(team.id);
        }
    }
}

// Sincronizar el modelo y llamar a la función principal
sequelize.sync().then(() => {
    getAllPlayers();
});