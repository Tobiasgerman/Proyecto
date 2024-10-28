const axios = require('axios');
const https = require('https');
const { Futbol } = require('../sequelize/models');
const sequelize = require('../sequelize/sequelize');

const API_URL = 'https://api.football-data.org/v4/';
const API_TOKEN = '20f15d7be30549db828caf69ed6a8258'; 

const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    headers: { 'X-Auth-Token': API_TOKEN }
});

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function extractWaitTime(errorMessage) {
    const match = errorMessage.match(/Wait (\d+) seconds/);
    if (match) {
        return parseInt(match[1], 10) * 1000; // Convertir segundos a milisegundos
    }
    return 60000; 
}

async function getLeagues() {
    try {
        const response = await axiosInstance.get(`${API_URL}competitions`);
        return response.data.competitions;
    } catch (error) {
        if (error.response) {
            const waitTime = extractWaitTime(error.response.data.message);
            console.error('Error en la respuesta del servidor al obtener las ligas:', error.response.status);
            await wait(waitTime);
            return getLeagues(); 
        } else {
            console.error('Error al obtener las ligas:', error.message);
        }
        return [];
    }
}

async function getTeams(leagueId) {
    try {
        const response = await axiosInstance.get(`${API_URL}competitions/${leagueId}/teams`);
        return response.data.teams;
    } catch (error) {
        if (error.response) {
            const waitTime = extractWaitTime(error.response.data.message);
            console.error('Error en la respuesta del servidor al obtener los equipos:', error.response.status);
            await wait(waitTime);
            return getTeams(leagueId); 
        } else {
            console.error('Error al obtener los equipos:', error.message);
        }
        return [];
    }
}

async function getPlayers(teamId) {
    try {
        const response = await axiosInstance.get(`${API_URL}teams/${teamId}`);
        const players = response.data.squad;
        for (const player of players) {
            await Futbol.create({
                nombre: player.name,
                nacionalidad: player.nationality,
                fechaNacimiento: player.dateOfBirth,
                posicion: player.position,
                numeroCamiseta: player.numeroCamiseta
            });
            console.log(`Guardado: ${player.name}`);
        }
    } catch (error) {
        if (error.response) {
            const waitTime = extractWaitTime(error.response.data.message);
            console.log(error.response.data.message);
            console.error('Error en la respuesta del servidor al obtener los jugadores:', error.response.status);
            await wait(waitTime); 
            return getPlayers(teamId); 
        } else {
            console.error('Error al obtener los jugadores:', error.message);
        }
    }
}

async function getAllPlayers() {
    const leagues = await getLeagues();
    for (const league of leagues) {
        const teams = await getTeams(league.id);
        for (const team of teams) {
            await getPlayers(team.id);
        }
    }
}

sequelize.sync().then(() => {
    getAllPlayers();
});