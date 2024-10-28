const axios = require('axios');
const { Futbol } = require('../sequelize/models');
const sequelize = require('../sequelize/sequelize');

// Configuración de la API
const API_URL = 'https://api.football-data.org/v4/';
const API_TOKEN = '20f15d7be30549db828caf69ed6a8258'; // Reemplaza con tu token de la API

// Función para obtener la lista de ligas
async function getLeagues() {
    try {
        const response = await axios.get(`${API_URL}competitions`, {
            headers: { 'X-Auth-Token': API_TOKEN }
        });
        return response.data.competitions;
    } catch (error) {
        console.error('Error al obtener las ligas:', error);
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
        console.error('Error al obtener los equipos:', error);
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
        console.error('Error al obtener los jugadores:', error);
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