const axios = require('axios');
const https = require('https');
const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Sequelize } = require('sequelize');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const { basquet } = require('./sequelize/models');

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

// Importa la lógica del juego
const { iniciarJuegoBasquet, adivinarJugadorBasquet } = require('./basquet/app')(sequelize);
const {iniciarJuegoFormula1, adivinarJugadorFormula1} = require('./formula1/app')(sequelize);

app.post('/iniciarJuegoBasquet', iniciarJuegoBasquet);
app.post('/adivinarJugadorBasquet', adivinarJugadorBasquet);
app.post('/iniciarJuegoFormula1', iniciarJuegoFormula1);
app.post('/adivinarJugaFormula1', adivinarJugadorFormula1);
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

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});
