const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const axios = require('axios');
const https = require('https');
const geolib = require('geolib');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
// Serve static files from Front directory
app.use(express.static('../Front'));

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// API Configuration
const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN;
const FOOTBALL_API_TOKEN = process.env.FOOTBALL_API_TOKEN;
const PORT = process.env.PORT || 3000;

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Game state management
const gameStates = {
    gamedle: { randomGame: null, attempts: 0 },
    football: { randomPlayer: null, attempts: 0 },
    basketball: { randomPlayer: null, attempts: 0 },
    formula1: { randomDriver: null, attempts: 0 }
};

// Countries data for Mundle game
const countries = [
    { name: "Argentina", latitude: -38.4161, longitude: -63.6167 },
    { name: "Brazil", latitude: -14.2350, longitude: -51.9253 },
    { name: "United States", latitude: 39.8283, longitude: -98.5795 },
    { name: "Canada", latitude: 56.1304, longitude: -106.3468 },
    { name: "Mexico", latitude: 23.6345, longitude: -102.5528 },
    { name: "Spain", latitude: 40.4637, longitude: -3.7492 },
    { name: "France", latitude: 46.2276, longitude: 2.2137 },
    { name: "Germany", latitude: 51.1657, longitude: 10.4515 },
    { name: "Italy", latitude: 41.8719, longitude: 12.5674 },
    { name: "United Kingdom", latitude: 55.3781, longitude: -3.4360 },
    { name: "Japan", latitude: 36.2048, longitude: 138.2529 },
    { name: "China", latitude: 35.8617, longitude: 104.1954 },
    { name: "India", latitude: 20.5937, longitude: 78.9629 },
    { name: "Russia", latitude: 61.5240, longitude: 105.3188 },
    { name: "Australia", latitude: -25.2744, longitude: 133.7751 }
];

// IGDB API Functions
async function getIGDBGames(searchQuery = null, popular = false) {
    if (!IGDB_CLIENT_ID || !IGDB_ACCESS_TOKEN) {
        throw new Error('IGDB API credentials not configured');
    }

    try {
        let query;
        if (searchQuery) {
            query = `fields name, platforms.name, genres.name, themes.name, game_modes.name, first_release_date, player_perspectives.name, involved_companies.company.name, game_engines.name; search "${searchQuery}"; limit 10;`;
        } else if (popular) {
            // Get popular games
            const popularResponse = await axios.post(
                'https://api.igdb.com/v4/popularity_primitives',
                'fields game_id; where popularity_source = 121; sort value desc; limit 100;',
                {
                    headers: {
                        'Client-ID': IGDB_CLIENT_ID,
                        'Authorization': `Bearer ${IGDB_ACCESS_TOKEN}`,
                        'Content-Type': 'text/plain'
                    },
                    httpsAgent
                }
            );

            const gameIds = popularResponse.data.map(item => item.game_id);
            if (gameIds.length === 0) {
                throw new Error('No popular games found');
            }

            query = `fields name, platforms.name, genres.name, themes.name, game_modes.name, first_release_date, player_perspectives.name, involved_companies.company.name, game_engines.name; where id = (${gameIds.join(',')});`;
        } else {
            query = `fields name, platforms.name, genres.name, themes.name, game_modes.name, first_release_date, player_perspectives.name, involved_companies.company.name, game_engines.name; limit 50; offset ${Math.floor(Math.random() * 1000)};`;
        }

        const response = await axios.post(
            'https://api.igdb.com/v4/games',
            query,
            {
                headers: {
                    'Client-ID': IGDB_CLIENT_ID,
                    'Authorization': `Bearer ${IGDB_ACCESS_TOKEN}`,
                    'Content-Type': 'text/plain'
                },
                httpsAgent
            }
        );

        return response.data;
    } catch (error) {
        console.error('IGDB API Error:', error.response?.data || error.message);
        throw error;
    }
}

// Football API Functions
async function getFootballPlayers(searchQuery = null) {
    if (!FOOTBALL_API_TOKEN) {
        throw new Error('Football API token not configured');
    }

    try {
        // For demo purposes, return mock data since the real API requires teams/competitions setup
        const mockPlayers = [
            { name: "Lionel Messi", nationality: "Argentina", position: "Forward", birthDate: "1987-06-24" },
            { name: "Cristiano Ronaldo", nationality: "Portugal", position: "Forward", birthDate: "1985-02-05" },
            { name: "Neymar Jr", nationality: "Brazil", position: "Forward", birthDate: "1992-02-05" },
            { name: "Kylian Mbappé", nationality: "France", position: "Forward", birthDate: "1998-12-20" },
            { name: "Kevin De Bruyne", nationality: "Belgium", position: "Midfielder", birthDate: "1991-06-28" }
        ];

        if (searchQuery) {
            return mockPlayers.filter(player => 
                player.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return mockPlayers;
    } catch (error) {
        console.error('Football API Error:', error.message);
        throw error;
    }
}

// Basketball API Functions (Mock data for now)
async function getBasketballPlayers(searchQuery = null) {
    const mockPlayers = [
        { name: "LeBron James", nationality: "USA", position: "Forward", birthDate: "1984-12-30" },
        { name: "Stephen Curry", nationality: "USA", position: "Guard", birthDate: "1988-03-14" },
        { name: "Kevin Durant", nationality: "USA", position: "Forward", birthDate: "1988-09-29" },
        { name: "Giannis Antetokounmpo", nationality: "Greece", position: "Forward", birthDate: "1994-12-06" },
        { name: "Luka Dončić", nationality: "Slovenia", position: "Guard", birthDate: "1999-02-28" }
    ];

    if (searchQuery) {
        return mockPlayers.filter(player => 
            player.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    return mockPlayers;
}

// Formula 1 API Functions (Mock data for now)
async function getFormula1Drivers(searchQuery = null) {
    const mockDrivers = [
        { name: "Lewis Hamilton", nationality: "British", team: "Mercedes", birthDate: "1985-01-07" },
        { name: "Max Verstappen", nationality: "Dutch", team: "Red Bull", birthDate: "1997-09-30" },
        { name: "Charles Leclerc", nationality: "Monégasque", team: "Ferrari", birthDate: "1997-10-16" },
        { name: "Carlos Sainz", nationality: "Spanish", team: "Ferrari", birthDate: "1994-09-01" },
        { name: "George Russell", nationality: "British", team: "Mercedes", birthDate: "1998-02-15" }
    ];

    if (searchQuery) {
        return mockDrivers.filter(driver => 
            driver.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    return mockDrivers;
}

// Utility Functions
function calculateDistance(origin, destination) {
    return geolib.getDistance(origin, destination) / 1000; // km
}

function calculateDirection(origin, destination) {
    const bearing = geolib.getCompassDirection(origin, destination);
    const directions = {
        "N": "Norte", "NNE": "Noreste", "NE": "Noreste", "ENE": "Este",
        "E": "Este", "ESE": "Sureste", "SE": "Sureste", "SSE": "Sureste",
        "S": "Sur", "SSW": "Suroeste", "SW": "Suroeste", "WSW": "Suroeste",
        "W": "Oeste", "WNW": "Noroeste", "NW": "Noroeste", "NNW": "Noroeste"
    };
    return directions[bearing] || bearing;
}

function compareGameAttributes(chosen, target) {
    const results = {};
    
    // Compare platforms
    const chosenPlatforms = chosen.platforms?.map(p => p.name) || [];
    const targetPlatforms = target.platforms?.map(p => p.name) || [];
    const platformMatch = chosenPlatforms.filter(p => targetPlatforms.includes(p));
    results.platforms = chosenPlatforms.length > 0 
        ? (platformMatch.length === chosenPlatforms.length ? 'Verde' : 'Amarillo')
        : 'Rojo';

    // Compare genres
    const chosenGenres = chosen.genres?.map(g => g.name) || [];
    const targetGenres = target.genres?.map(g => g.name) || [];
    const genreMatch = chosenGenres.filter(g => targetGenres.includes(g));
    results.genres = chosenGenres.length > 0 
        ? (genreMatch.length === chosenGenres.length ? 'Verde' : 'Amarillo')
        : 'Rojo';

    // Compare themes
    const chosenThemes = chosen.themes?.map(t => t.name) || [];
    const targetThemes = target.themes?.map(t => t.name) || [];
    const themeMatch = chosenThemes.filter(t => targetThemes.includes(t));
    results.themes = chosenThemes.length > 0 
        ? (themeMatch.length === chosenThemes.length ? 'Verde' : 'Amarillo')
        : 'Rojo';

    // Compare game modes
    const chosenModes = chosen.game_modes?.map(m => m.name) || [];
    const targetModes = target.game_modes?.map(m => m.name) || [];
    const modeMatch = chosenModes.filter(m => targetModes.includes(m));
    results.game_modes = chosenModes.length > 0 
        ? (modeMatch.length === chosenModes.length ? 'Verde' : 'Amarillo')
        : 'Rojo';

    // Compare perspectives
    const chosenPerspectives = chosen.player_perspectives?.map(p => p.name) || [];
    const targetPerspectives = target.player_perspectives?.map(p => p.name) || [];
    const perspectiveMatch = chosenPerspectives.filter(p => targetPerspectives.includes(p));
    results.perspectives = chosenPerspectives.length > 0 
        ? (perspectiveMatch.length === chosenPerspectives.length ? 'Verde' : 'Amarillo')
        : 'Rojo';

    // Compare release date
    const chosenYear = chosen.first_release_date ? new Date(chosen.first_release_date * 1000).getFullYear() : null;
    const targetYear = target.first_release_date ? new Date(target.first_release_date * 1000).getFullYear() : null;
    results.release_date = chosenYear === targetYear ? 'Verde' : 'Rojo';
    results.release_date_direction = chosenYear && targetYear ? (chosenYear > targetYear ? '⬇' : '⬆') : '';

    // Compare developers
    const chosenDevelopers = chosen.involved_companies?.map(c => c.company.name) || [];
    const targetDevelopers = target.involved_companies?.map(c => c.company.name) || [];
    const developerMatch = chosenDevelopers.filter(d => targetDevelopers.includes(d));
    results.developers = chosenDevelopers.length > 0 
        ? (developerMatch.length === chosenDevelopers.length ? 'Verde' : 'Amarillo')
        : 'Rojo';

    // Compare engines
    const chosenEngines = chosen.game_engines?.map(e => e.name) || [];
    const targetEngines = target.game_engines?.map(e => e.name) || [];
    const engineMatch = chosenEngines.filter(e => targetEngines.includes(e));
    results.engines = chosenEngines.length > 0 
        ? (engineMatch.length === chosenEngines.length ? 'Verde' : 'Amarillo')
        : 'Rojo';

    return results;
}

// API Routes

// Gamedle Routes
app.post('/api/gamedle/start', async (req, res) => {
    try {
        const { knownMode } = req.body;
        const games = await getIGDBGames(null, knownMode);
        
        if (!games || games.length === 0) {
            return res.status(500).json({ error: 'No games found' });
        }

        const randomGame = games[Math.floor(Math.random() * games.length)];
        gameStates.gamedle.randomGame = randomGame;
        gameStates.gamedle.attempts = 0;

        res.json({ message: 'Game started! Guess the game!', gameId: 'gamedle' });
    } catch (error) {
        console.error('Error starting gamedle:', error.message);
        res.status(500).json({ error: 'Failed to start game' });
    }
});

app.post('/api/gamedle/guess', async (req, res) => {
    try {
        const { gameName } = req.body;
        
        if (!gameStates.gamedle.randomGame) {
            return res.status(400).json({ error: 'No game in progress' });
        }

        if (gameStates.gamedle.attempts >= 5) {
            return res.json({ 
                message: `Game over! The game was: ${gameStates.gamedle.randomGame.name}`,
                gameOver: true
            });
        }

        const games = await getIGDBGames(gameName);
        const chosenGame = games.find(g => g.name.toLowerCase() === gameName.toLowerCase());

        if (!chosenGame) {
            return res.status(404).json({ error: 'Game not found' });
        }

        gameStates.gamedle.attempts++;

        if (chosenGame.name === gameStates.gamedle.randomGame.name) {
            return res.json({ 
                message: 'You won!', 
                won: true,
                attempts: gameStates.gamedle.attempts
            });
        }

        const comparison = compareGameAttributes(chosenGame, gameStates.gamedle.randomGame);
        
        res.json({
            ...comparison,
            attempts: gameStates.gamedle.attempts,
            chosenGame: chosenGame.name
        });
    } catch (error) {
        console.error('Error in gamedle guess:', error.message);
        res.status(500).json({ error: 'Failed to process guess' });
    }
});

// Sports Routes (Football, Basketball, Formula 1)
app.post('/api/sports/:sport/start', async (req, res) => {
    try {
        const { sport } = req.params;
        let players;

        switch (sport) {
            case 'football':
                players = await getFootballPlayers();
                break;
            case 'basketball':
                players = await getBasketballPlayers();
                break;
            case 'formula1':
                players = await getFormula1Drivers();
                break;
            default:
                return res.status(400).json({ error: 'Invalid sport' });
        }

        const randomPlayer = players[Math.floor(Math.random() * players.length)];
        gameStates[sport].randomPlayer = randomPlayer;
        gameStates[sport].attempts = 0;

        res.json({ message: `${sport} game started! Guess the player!` });
    } catch (error) {
        console.error(`Error starting ${sport} game:`, error.message);
        res.status(500).json({ error: 'Failed to start game' });
    }
});

app.post('/api/sports/:sport/guess', async (req, res) => {
    try {
        const { sport } = req.params;
        const { playerName } = req.body;

        if (!gameStates[sport].randomPlayer) {
            return res.status(400).json({ error: 'No game in progress' });
        }

        if (gameStates[sport].attempts >= 5) {
            return res.json({ 
                message: `Game over! The player was: ${gameStates[sport].randomPlayer.name}`,
                gameOver: true
            });
        }

        let players;
        switch (sport) {
            case 'football':
                players = await getFootballPlayers(playerName);
                break;
            case 'basketball':
                players = await getBasketballPlayers(playerName);
                break;
            case 'formula1':
                players = await getFormula1Drivers(playerName);
                break;
        }

        const chosenPlayer = players.find(p => p.name.toLowerCase() === playerName.toLowerCase());

        if (!chosenPlayer) {
            return res.status(404).json({ error: 'Player not found' });
        }

        gameStates[sport].attempts++;
        const targetPlayer = gameStates[sport].randomPlayer;

        if (chosenPlayer.name === targetPlayer.name) {
            return res.json({ 
                message: 'You won!', 
                won: true,
                attempts: gameStates[sport].attempts
            });
        }

        // Compare player attributes
        const results = {
            name: 'Rojo',
            nationality: chosenPlayer.nationality === targetPlayer.nationality ? 'Verde' : 'Rojo',
            position: chosenPlayer.position === targetPlayer.position ? 'Verde' : 'Rojo',
            birthDate: chosenPlayer.birthDate === targetPlayer.birthDate ? 'Verde' : 'Rojo',
            birthDateDirection: new Date(chosenPlayer.birthDate) > new Date(targetPlayer.birthDate) ? '⬇' : '⬆',
            attempts: gameStates[sport].attempts,
            chosenPlayer: {
                name: chosenPlayer.name,
                nationality: chosenPlayer.nationality,
                position: chosenPlayer.position,
                birthDate: chosenPlayer.birthDate
            }
        };

        if (sport === 'formula1') {
            results.team = chosenPlayer.team === targetPlayer.team ? 'Verde' : 'Rojo';
            results.chosenPlayer.team = chosenPlayer.team;
        }

        res.json(results);
    } catch (error) {
        console.error(`Error in ${sport} guess:`, error.message);
        res.status(500).json({ error: 'Failed to process guess' });
    }
});

// Mundle Routes
app.get('/api/mundle/random-country', (req, res) => {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    res.json(randomCountry);
});

app.post('/api/mundle/distance', (req, res) => {
    try {
        const { chosenCountry, targetCountry } = req.body;
        
        const chosen = countries.find(c => c.name.toLowerCase() === chosenCountry.toLowerCase());
        const target = countries.find(c => c.name.toLowerCase() === targetCountry.toLowerCase());

        if (!chosen || !target) {
            return res.status(404).json({ error: 'Country not found' });
        }

        const distance = calculateDistance(
            { latitude: chosen.latitude, longitude: chosen.longitude },
            { latitude: target.latitude, longitude: target.longitude }
        );

        const direction = calculateDirection(
            { latitude: chosen.latitude, longitude: chosen.longitude },
            { latitude: target.latitude, longitude: target.longitude }
        );

        res.json({ distance: Math.round(distance), direction });
    } catch (error) {
        console.error('Error calculating distance:', error.message);
        res.status(500).json({ error: 'Failed to calculate distance' });
    }
});

// Socket.IO for autocomplete
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('autocomplete', async (query, gameType) => {
        try {
            let suggestions = [];

            switch (gameType) {
                case 'gamedle':
                    if (query.length > 2) {
                        const games = await getIGDBGames(query);
                        suggestions = games.map(game => game.name).slice(0, 10);
                    }
                    break;
                case 'football':
                    const footballPlayers = await getFootballPlayers(query);
                    suggestions = footballPlayers.map(player => player.name).slice(0, 10);
                    break;
                case 'basketball':
                    const basketballPlayers = await getBasketballPlayers(query);
                    suggestions = basketballPlayers.map(player => player.name).slice(0, 10);
                    break;
                case 'formula1':
                    const f1Drivers = await getFormula1Drivers(query);
                    suggestions = f1Drivers.map(driver => driver.name).slice(0, 10);
                    break;
                case 'mundle':
                    suggestions = countries
                        .filter(country => country.name.toLowerCase().includes(query.toLowerCase()))
                        .map(country => country.name)
                        .slice(0, 10);
                    break;
            }

            socket.emit('suggestions', suggestions);
        } catch (error) {
            console.error('Autocomplete error:', error.message);
            socket.emit('autocompleteError', error.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});