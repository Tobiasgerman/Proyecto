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

// Comprehensive Countries data for Mundle game
const countries = [
    // Americas
    { name: "Argentina", latitude: -38.4161, longitude: -63.6167, continent: "South America" },
    { name: "Brazil", latitude: -14.2350, longitude: -51.9253, continent: "South America" },
    { name: "Canada", latitude: 56.1304, longitude: -106.3468, continent: "North America" },
    { name: "Chile", latitude: -35.6751, longitude: -71.5430, continent: "South America" },
    { name: "Colombia", latitude: 4.5709, longitude: -74.2973, continent: "South America" },
    { name: "Mexico", latitude: 23.6345, longitude: -102.5528, continent: "North America" },
    { name: "Peru", latitude: -9.1900, longitude: -75.0152, continent: "South America" },
    { name: "United States", latitude: 39.8283, longitude: -98.5795, continent: "North America" },
    { name: "Uruguay", latitude: -32.5228, longitude: -55.7658, continent: "South America" },
    { name: "Venezuela", latitude: 6.4238, longitude: -66.5897, continent: "South America" },
    
    // Europe
    { name: "Belgium", latitude: 50.5039, longitude: 4.4699, continent: "Europe" },
    { name: "Denmark", latitude: 56.2639, longitude: 9.5018, continent: "Europe" },
    { name: "Finland", latitude: 61.9241, longitude: 25.7482, continent: "Europe" },
    { name: "France", latitude: 46.2276, longitude: 2.2137, continent: "Europe" },
    { name: "Germany", latitude: 51.1657, longitude: 10.4515, continent: "Europe" },
    { name: "Greece", latitude: 39.0742, longitude: 21.8243, continent: "Europe" },
    { name: "Iceland", latitude: 64.9631, longitude: -19.0208, continent: "Europe" },
    { name: "Ireland", latitude: 53.4129, longitude: -8.2439, continent: "Europe" },
    { name: "Italy", latitude: 41.8719, longitude: 12.5674, continent: "Europe" },
    { name: "Netherlands", latitude: 52.1326, longitude: 5.2913, continent: "Europe" },
    { name: "Norway", latitude: 60.4720, longitude: 8.4689, continent: "Europe" },
    { name: "Poland", latitude: 51.9194, longitude: 19.1451, continent: "Europe" },
    { name: "Portugal", latitude: 39.3999, longitude: -8.2245, continent: "Europe" },
    { name: "Spain", latitude: 40.4637, longitude: -3.7492, continent: "Europe" },
    { name: "Sweden", latitude: 60.1282, longitude: 18.6435, continent: "Europe" },
    { name: "Switzerland", latitude: 46.8182, longitude: 8.2275, continent: "Europe" },
    { name: "United Kingdom", latitude: 55.3781, longitude: -3.4360, continent: "Europe" },
    
    // Asia
    { name: "China", latitude: 35.8617, longitude: 104.1954, continent: "Asia" },
    { name: "India", latitude: 20.5937, longitude: 78.9629, continent: "Asia" },
    { name: "Indonesia", latitude: -0.7893, longitude: 113.9213, continent: "Asia" },
    { name: "Japan", latitude: 36.2048, longitude: 138.2529, continent: "Asia" },
    { name: "Malaysia", latitude: 4.2105, longitude: 101.9758, continent: "Asia" },
    { name: "Philippines", latitude: 12.8797, longitude: 121.7740, continent: "Asia" },
    { name: "Singapore", latitude: 1.3521, longitude: 103.8198, continent: "Asia" },
    { name: "South Korea", latitude: 35.9078, longitude: 127.7669, continent: "Asia" },
    { name: "Thailand", latitude: 15.8700, longitude: 100.9925, continent: "Asia" },
    { name: "Vietnam", latitude: 14.0583, longitude: 108.2772, continent: "Asia" },
    
    // Africa
    { name: "Egypt", latitude: 26.0975, longitude: 30.0444, continent: "Africa" },
    { name: "Kenya", latitude: -0.0236, longitude: 37.9062, continent: "Africa" },
    { name: "Morocco", latitude: 31.7917, longitude: -7.0926, continent: "Africa" },
    { name: "Nigeria", latitude: 9.0820, longitude: 8.6753, continent: "Africa" },
    { name: "South Africa", latitude: -30.5595, longitude: 22.9375, continent: "Africa" },
    
    // Oceania
    { name: "Australia", latitude: -25.2744, longitude: 133.7751, continent: "Oceania" },
    { name: "New Zealand", latitude: -40.9006, longitude: 174.8860, continent: "Oceania" },
    
    // Middle East
    { name: "Israel", latitude: 31.0461, longitude: 34.8516, continent: "Asia" },
    { name: "Turkey", latitude: 38.9637, longitude: 35.2433, continent: "Asia" },
    { name: "United Arab Emirates", latitude: 23.4241, longitude: 53.8478, continent: "Asia" },
    
    // Europe (continued)
    { name: "Austria", latitude: 47.5162, longitude: 14.5501, continent: "Europe" },
    { name: "Czech Republic", latitude: 49.8175, longitude: 15.4730, continent: "Europe" },
    { name: "Hungary", latitude: 47.1625, longitude: 19.5033, continent: "Europe" },
    { name: "Romania", latitude: 45.9432, longitude: 24.9668, continent: "Europe" },
    { name: "Russia", latitude: 61.5240, longitude: 105.3188, continent: "Europe/Asia" }
];

// IGDB API Functions
async function getIGDBGames(searchQuery = null, popular = false) {
    // First try IGDB if credentials are available
    if (IGDB_CLIENT_ID && IGDB_ACCESS_TOKEN && IGDB_CLIENT_ID !== 'your_client_id_here') {
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
            console.log('Falling back to local game database...');
        }
    }

    // Fallback to comprehensive local database
    const gamesDatabase = [
        {
            name: "The Legend of Zelda: Breath of the Wild",
            platforms: [{ name: "Nintendo Switch" }, { name: "Wii U" }],
            genres: [{ name: "Action" }, { name: "Adventure" }, { name: "RPG" }],
            themes: [{ name: "Fantasy" }, { name: "Open World" }],
            game_modes: [{ name: "Single player" }],
            first_release_date: 1488240000, // 2017
            player_perspectives: [{ name: "Third person" }],
            involved_companies: [{ company: { name: "Nintendo" } }],
            game_engines: [{ name: "Nintendo Engine" }]
        },
        {
            name: "Red Dead Redemption 2",
            platforms: [{ name: "PlayStation 4" }, { name: "Xbox One" }, { name: "PC" }],
            genres: [{ name: "Action" }, { name: "Adventure" }],
            themes: [{ name: "Western" }, { name: "Open World" }],
            game_modes: [{ name: "Single player" }, { name: "Multiplayer" }],
            first_release_date: 1540425600, // 2018
            player_perspectives: [{ name: "Third person" }, { name: "First person" }],
            involved_companies: [{ company: { name: "Rockstar Games" } }],
            game_engines: [{ name: "RAGE" }]
        },
        {
            name: "God of War",
            platforms: [{ name: "PlayStation 4" }, { name: "PC" }],
            genres: [{ name: "Action" }, { name: "Adventure" }],
            themes: [{ name: "Mythology" }, { name: "Norse" }],
            game_modes: [{ name: "Single player" }],
            first_release_date: 1524096000, // 2018
            player_perspectives: [{ name: "Third person" }],
            involved_companies: [{ company: { name: "Sony Interactive Entertainment" } }],
            game_engines: [{ name: "Santa Monica Engine" }]
        },
        {
            name: "Cyberpunk 2077",
            platforms: [{ name: "PC" }, { name: "PlayStation 4" }, { name: "Xbox One" }, { name: "PlayStation 5" }, { name: "Xbox Series X/S" }],
            genres: [{ name: "RPG" }, { name: "Action" }],
            themes: [{ name: "Cyberpunk" }, { name: "Dystopian" }],
            game_modes: [{ name: "Single player" }],
            first_release_date: 1607558400, // 2020
            player_perspectives: [{ name: "First person" }, { name: "Third person" }],
            involved_companies: [{ company: { name: "CD Projekt" } }],
            game_engines: [{ name: "REDengine 4" }]
        },
        {
            name: "Minecraft",
            platforms: [{ name: "PC" }, { name: "Mobile" }, { name: "PlayStation" }, { name: "Xbox" }, { name: "Nintendo Switch" }],
            genres: [{ name: "Sandbox" }, { name: "Survival" }],
            themes: [{ name: "Building" }, { name: "Exploration" }],
            game_modes: [{ name: "Single player" }, { name: "Multiplayer" }],
            first_release_date: 1321920000, // 2011
            player_perspectives: [{ name: "First person" }, { name: "Third person" }],
            involved_companies: [{ company: { name: "Mojang Studios" } }],
            game_engines: [{ name: "Java" }]
        },
        {
            name: "Fortnite",
            platforms: [{ name: "PC" }, { name: "Mobile" }, { name: "PlayStation" }, { name: "Xbox" }, { name: "Nintendo Switch" }],
            genres: [{ name: "Battle Royale" }, { name: "Action" }],
            themes: [{ name: "Cartoon" }, { name: "Building" }],
            game_modes: [{ name: "Multiplayer" }],
            first_release_date: 1500940800, // 2017
            player_perspectives: [{ name: "Third person" }],
            involved_companies: [{ company: { name: "Epic Games" } }],
            game_engines: [{ name: "Unreal Engine 4" }]
        },
        {
            name: "The Witcher 3: Wild Hunt",
            platforms: [{ name: "PC" }, { name: "PlayStation 4" }, { name: "Xbox One" }, { name: "Nintendo Switch" }],
            genres: [{ name: "RPG" }, { name: "Action" }],
            themes: [{ name: "Fantasy" }, { name: "Medieval" }],
            game_modes: [{ name: "Single player" }],
            first_release_date: 1431993600, // 2015
            player_perspectives: [{ name: "Third person" }],
            involved_companies: [{ company: { name: "CD Projekt" } }],
            game_engines: [{ name: "REDengine 3" }]
        },
        {
            name: "Grand Theft Auto V",
            platforms: [{ name: "PC" }, { name: "PlayStation" }, { name: "Xbox" }],
            genres: [{ name: "Action" }, { name: "Adventure" }],
            themes: [{ name: "Crime" }, { name: "Open World" }],
            game_modes: [{ name: "Single player" }, { name: "Multiplayer" }],
            first_release_date: 1379376000, // 2013
            player_perspectives: [{ name: "Third person" }, { name: "First person" }],
            involved_companies: [{ company: { name: "Rockstar Games" } }],
            game_engines: [{ name: "RAGE" }]
        },
        {
            name: "Elden Ring",
            platforms: [{ name: "PC" }, { name: "PlayStation 4" }, { name: "PlayStation 5" }, { name: "Xbox One" }, { name: "Xbox Series X/S" }],
            genres: [{ name: "RPG" }, { name: "Action" }],
            themes: [{ name: "Fantasy" }, { name: "Dark Fantasy" }],
            game_modes: [{ name: "Single player" }, { name: "Multiplayer" }],
            first_release_date: 1645747200, // 2022
            player_perspectives: [{ name: "Third person" }],
            involved_companies: [{ company: { name: "FromSoftware" } }],
            game_engines: [{ name: "FromSoftware Engine" }]
        },
        {
            name: "Super Mario Odyssey",
            platforms: [{ name: "Nintendo Switch" }],
            genres: [{ name: "Platform" }, { name: "Adventure" }],
            themes: [{ name: "Fantasy" }, { name: "Family-friendly" }],
            game_modes: [{ name: "Single player" }, { name: "Co-op" }],
            first_release_date: 1509408000, // 2017
            player_perspectives: [{ name: "Third person" }],
            involved_companies: [{ company: { name: "Nintendo" } }],
            game_engines: [{ name: "Nintendo Engine" }]
        },
        {
            name: "Call of Duty: Modern Warfare",
            platforms: [{ name: "PC" }, { name: "PlayStation 4" }, { name: "Xbox One" }],
            genres: [{ name: "Shooter" }, { name: "Action" }],
            themes: [{ name: "Military" }, { name: "Modern" }],
            game_modes: [{ name: "Single player" }, { name: "Multiplayer" }],
            first_release_date: 1571875200, // 2019
            player_perspectives: [{ name: "First person" }],
            involved_companies: [{ company: { name: "Activision" } }],
            game_engines: [{ name: "IW 8.0" }]
        },
        {
            name: "Overwatch 2",
            platforms: [{ name: "PC" }, { name: "PlayStation" }, { name: "Xbox" }, { name: "Nintendo Switch" }],
            genres: [{ name: "Shooter" }, { name: "Action" }],
            themes: [{ name: "Hero-based" }, { name: "Team-based" }],
            game_modes: [{ name: "Multiplayer" }],
            first_release_date: 1664928000, // 2022
            player_perspectives: [{ name: "First person" }],
            involved_companies: [{ company: { name: "Blizzard Entertainment" } }],
            game_engines: [{ name: "Overwatch Engine" }]
        }
    ];

    if (searchQuery) {
        return gamesDatabase.filter(game => 
            game.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    return gamesDatabase;
}

// Football API Functions
async function getFootballPlayers(searchQuery = null) {
    try {
        // Comprehensive football players database
        const footballPlayers = [
            // Forwards
            { name: "Lionel Messi", nationality: "Argentina", position: "Forward", birthDate: "1987-06-24", team: "Inter Miami" },
            { name: "Cristiano Ronaldo", nationality: "Portugal", position: "Forward", birthDate: "1985-02-05", team: "Al Nassr" },
            { name: "Kylian Mbappé", nationality: "France", position: "Forward", birthDate: "1998-12-20", team: "Real Madrid" },
            { name: "Erling Haaland", nationality: "Norway", position: "Forward", birthDate: "2000-07-21", team: "Manchester City" },
            { name: "Harry Kane", nationality: "England", position: "Forward", birthDate: "1993-07-28", team: "Bayern Munich" },
            { name: "Neymar Jr", nationality: "Brazil", position: "Forward", birthDate: "1992-02-05", team: "Al Hilal" },
            { name: "Robert Lewandowski", nationality: "Poland", position: "Forward", birthDate: "1988-08-21", team: "Barcelona" },
            { name: "Mohamed Salah", nationality: "Egypt", position: "Forward", birthDate: "1992-06-15", team: "Liverpool" },
            { name: "Karim Benzema", nationality: "France", position: "Forward", birthDate: "1987-12-19", team: "Al Ittihad" },
            { name: "Vinicius Jr", nationality: "Brazil", position: "Forward", birthDate: "2000-07-12", team: "Real Madrid" },
            
            // Midfielders
            { name: "Kevin De Bruyne", nationality: "Belgium", position: "Midfielder", birthDate: "1991-06-28", team: "Manchester City" },
            { name: "Luka Modrić", nationality: "Croatia", position: "Midfielder", birthDate: "1985-09-09", team: "Real Madrid" },
            { name: "Jude Bellingham", nationality: "England", position: "Midfielder", birthDate: "2003-06-29", team: "Real Madrid" },
            { name: "Bruno Fernandes", nationality: "Portugal", position: "Midfielder", birthDate: "1994-09-08", team: "Manchester United" },
            { name: "Frenkie de Jong", nationality: "Netherlands", position: "Midfielder", birthDate: "1997-05-12", team: "Barcelona" },
            { name: "Casemiro", nationality: "Brazil", position: "Midfielder", birthDate: "1992-02-23", team: "Manchester United" },
            { name: "Rodri", nationality: "Spain", position: "Midfielder", birthDate: "1996-06-22", team: "Manchester City" },
            { name: "Joshua Kimmich", nationality: "Germany", position: "Midfielder", birthDate: "1995-02-08", team: "Bayern Munich" },
            { name: "N'Golo Kanté", nationality: "France", position: "Midfielder", birthDate: "1991-03-29", team: "Al Ittihad" },
            { name: "Pedri", nationality: "Spain", position: "Midfielder", birthDate: "2002-11-25", team: "Barcelona" },
            
            // Defenders
            { name: "Virgil van Dijk", nationality: "Netherlands", position: "Defender", birthDate: "1991-07-08", team: "Liverpool" },
            { name: "Sergio Ramos", nationality: "Spain", position: "Defender", birthDate: "1986-03-30", team: "PSG" },
            { name: "Ruben Dias", nationality: "Portugal", position: "Defender", birthDate: "1997-05-14", team: "Manchester City" },
            { name: "Marquinhos", nationality: "Brazil", position: "Defender", birthDate: "1994-05-14", team: "PSG" },
            { name: "Andrew Robertson", nationality: "Scotland", position: "Defender", birthDate: "1994-03-11", team: "Liverpool" },
            { name: "João Cancelo", nationality: "Portugal", position: "Defender", birthDate: "1994-05-27", team: "Barcelona" },
            { name: "Alphonso Davies", nationality: "Canada", position: "Defender", birthDate: "2000-11-02", team: "Bayern Munich" },
            { name: "Alessandro Bastoni", nationality: "Italy", position: "Defender", birthDate: "1999-04-13", team: "Inter Milan" },
            
            // Goalkeepers
            { name: "Thibaut Courtois", nationality: "Belgium", position: "Goalkeeper", birthDate: "1992-05-11", team: "Real Madrid" },
            { name: "Alisson Becker", nationality: "Brazil", position: "Goalkeeper", birthDate: "1993-10-02", team: "Liverpool" },
            { name: "Manuel Neuer", nationality: "Germany", position: "Goalkeeper", birthDate: "1986-03-27", team: "Bayern Munich" },
            { name: "Gianluigi Donnarumma", nationality: "Italy", position: "Goalkeeper", birthDate: "1999-02-25", team: "PSG" },
            { name: "Ederson", nationality: "Brazil", position: "Goalkeeper", birthDate: "1993-08-17", team: "Manchester City" }
        ];

        if (searchQuery) {
            return footballPlayers.filter(player => 
                player.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return footballPlayers;
    } catch (error) {
        console.error('Football API Error:', error.message);
        throw error;
    }
}

// Basketball API Functions
async function getBasketballPlayers(searchQuery = null) {
    // Comprehensive NBA players database
    const basketballPlayers = [
        // Current Superstars
        { name: "LeBron James", nationality: "USA", position: "Forward", birthDate: "1984-12-30", team: "Los Angeles Lakers" },
        { name: "Stephen Curry", nationality: "USA", position: "Guard", birthDate: "1988-03-14", team: "Golden State Warriors" },
        { name: "Kevin Durant", nationality: "USA", position: "Forward", birthDate: "1988-09-29", team: "Phoenix Suns" },
        { name: "Giannis Antetokounmpo", nationality: "Greece", position: "Forward", birthDate: "1994-12-06", team: "Milwaukee Bucks" },
        { name: "Luka Dončić", nationality: "Slovenia", position: "Guard", birthDate: "1999-02-28", team: "Dallas Mavericks" },
        { name: "Nikola Jokić", nationality: "Serbia", position: "Center", birthDate: "1995-02-19", team: "Denver Nuggets" },
        { name: "Joel Embiid", nationality: "Cameroon", position: "Center", birthDate: "1994-03-16", team: "Philadelphia 76ers" },
        { name: "Jayson Tatum", nationality: "USA", position: "Forward", birthDate: "1998-03-03", team: "Boston Celtics" },
        { name: "Damian Lillard", nationality: "USA", position: "Guard", birthDate: "1990-07-15", team: "Milwaukee Bucks" },
        { name: "Anthony Davis", nationality: "USA", position: "Forward", birthDate: "1993-03-11", team: "Los Angeles Lakers" },
        
        // Rising Stars
        { name: "Ja Morant", nationality: "USA", position: "Guard", birthDate: "1999-08-10", team: "Memphis Grizzlies" },
        { name: "Zion Williamson", nationality: "USA", position: "Forward", birthDate: "2000-07-06", team: "New Orleans Pelicans" },
        { name: "Trae Young", nationality: "USA", position: "Guard", birthDate: "1998-09-19", team: "Atlanta Hawks" },
        { name: "Devin Booker", nationality: "USA", position: "Guard", birthDate: "1996-10-30", team: "Phoenix Suns" },
        { name: "Victor Wembanyama", nationality: "France", position: "Center", birthDate: "2004-01-04", team: "San Antonio Spurs" },
        { name: "Paolo Banchero", nationality: "USA", position: "Forward", birthDate: "2002-11-12", team: "Orlando Magic" },
        { name: "Scottie Barnes", nationality: "USA", position: "Forward", birthDate: "2001-08-01", team: "Toronto Raptors" },
        { name: "Anthony Edwards", nationality: "USA", position: "Guard", birthDate: "2001-08-05", team: "Minnesota Timberwolves" },
        { name: "Cade Cunningham", nationality: "USA", position: "Guard", birthDate: "2001-09-25", team: "Detroit Pistons" },
        { name: "Franz Wagner", nationality: "Germany", position: "Forward", birthDate: "2001-08-27", team: "Orlando Magic" },
        
        // Veterans
        { name: "Chris Paul", nationality: "USA", position: "Guard", birthDate: "1985-05-06", team: "Golden State Warriors" },
        { name: "Russell Westbrook", nationality: "USA", position: "Guard", birthDate: "1988-11-12", team: "Los Angeles Clippers" },
        { name: "James Harden", nationality: "USA", position: "Guard", birthDate: "1989-08-26", team: "Los Angeles Clippers" },
        { name: "Kawhi Leonard", nationality: "USA", position: "Forward", birthDate: "1991-06-29", team: "Los Angeles Clippers" },
        { name: "Paul George", nationality: "USA", position: "Forward", birthDate: "1990-05-02", team: "Los Angeles Clippers" },
        
        // International Stars
        { name: "Dennis Schröder", nationality: "Germany", position: "Guard", birthDate: "1993-09-15", team: "Toronto Raptors" },
        { name: "Alperen Şengün", nationality: "Turkey", position: "Center", birthDate: "2002-07-25", team: "Houston Rockets" },
        { name: "Kristaps Porziņģis", nationality: "Latvia", position: "Center", birthDate: "1995-08-02", team: "Boston Celtics" },
        { name: "Rui Hachimura", nationality: "Japan", position: "Forward", birthDate: "1998-02-08", team: "Los Angeles Lakers" },
        { name: "Shai Gilgeous-Alexander", nationality: "Canada", position: "Guard", birthDate: "1998-07-12", team: "Oklahoma City Thunder" }
    ];

    if (searchQuery) {
        return basketballPlayers.filter(player => 
            player.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    return basketballPlayers;
}

// Formula 1 API Functions
async function getFormula1Drivers(searchQuery = null) {
    // Current and recent Formula 1 drivers database
    const f1Drivers = [
        // Current Grid (2024)
        { name: "Max Verstappen", nationality: "Dutch", team: "Red Bull Racing", birthDate: "1997-09-30", number: 1, position: "Driver" },
        { name: "Sergio Pérez", nationality: "Mexican", team: "Red Bull Racing", birthDate: "1990-01-26", number: 11, position: "Driver" },
        { name: "Charles Leclerc", nationality: "Monégasque", team: "Ferrari", birthDate: "1997-10-16", number: 16, position: "Driver" },
        { name: "Carlos Sainz", nationality: "Spanish", team: "Ferrari", birthDate: "1994-09-01", number: 55, position: "Driver" },
        { name: "Lewis Hamilton", nationality: "British", team: "Mercedes", birthDate: "1985-01-07", number: 44, position: "Driver" },
        { name: "George Russell", nationality: "British", team: "Mercedes", birthDate: "1998-02-15", number: 63, position: "Driver" },
        { name: "Lando Norris", nationality: "British", team: "McLaren", birthDate: "1999-11-13", number: 4, position: "Driver" },
        { name: "Oscar Piastri", nationality: "Australian", team: "McLaren", birthDate: "2001-04-06", number: 81, position: "Driver" },
        { name: "Fernando Alonso", nationality: "Spanish", team: "Aston Martin", birthDate: "1981-07-29", number: 14, position: "Driver" },
        { name: "Lance Stroll", nationality: "Canadian", team: "Aston Martin", birthDate: "1998-10-29", number: 18, position: "Driver" },
        { name: "Pierre Gasly", nationality: "French", team: "Alpine", birthDate: "1996-02-07", number: 10, position: "Driver" },
        { name: "Esteban Ocon", nationality: "French", team: "Alpine", birthDate: "1996-09-17", number: 31, position: "Driver" },
        { name: "Alex Albon", nationality: "Thai", team: "Williams", birthDate: "1996-03-23", number: 23, position: "Driver" },
        { name: "Logan Sargeant", nationality: "American", team: "Williams", birthDate: "2000-12-31", number: 2, position: "Driver" },
        { name: "Valtteri Bottas", nationality: "Finnish", team: "Alfa Romeo", birthDate: "1989-08-28", number: 77, position: "Driver" },
        { name: "Zhou Guanyu", nationality: "Chinese", team: "Alfa Romeo", birthDate: "1999-05-30", number: 24, position: "Driver" },
        { name: "Kevin Magnussen", nationality: "Danish", team: "Haas", birthDate: "1992-10-05", number: 20, position: "Driver" },
        { name: "Nico Hulkenberg", nationality: "German", team: "Haas", birthDate: "1987-08-19", number: 27, position: "Driver" },
        { name: "Yuki Tsunoda", nationality: "Japanese", team: "AlphaTauri", birthDate: "2000-05-11", number: 22, position: "Driver" },
        { name: "Daniel Ricciardo", nationality: "Australian", team: "AlphaTauri", birthDate: "1989-07-01", number: 3, position: "Driver" },
        
        // Recent Legends and Notable Drivers
        { name: "Sebastian Vettel", nationality: "German", team: "Retired (Aston Martin)", birthDate: "1987-07-03", number: 5 },
        { name: "Kimi Räikkönen", nationality: "Finnish", team: "Retired (Alfa Romeo)", birthDate: "1979-10-17", number: 7 },
        { name: "Mick Schumacher", nationality: "German", team: "Reserve Driver", birthDate: "1999-03-22", number: 47 },
        { name: "Antonio Giovinazzi", nationality: "Italian", team: "Reserve Driver", birthDate: "1993-12-14", number: 99 },
        { name: "Nyck de Vries", nationality: "Dutch", team: "Reserve Driver", birthDate: "1995-02-06", number: 45 },
        
        // Hall of Fame (for variety)
        { name: "Michael Schumacher", nationality: "German", team: "Retired (Mercedes)", birthDate: "1969-01-03", number: 91 },
        { name: "Ayrton Senna", nationality: "Brazilian", team: "McLaren (Legend)", birthDate: "1960-03-21", number: 12 },
        { name: "Alain Prost", nationality: "French", team: "McLaren (Legend)", birthDate: "1955-02-24", number: 8 }
    ];

    if (searchQuery) {
        return f1Drivers.filter(driver => 
            driver.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    return f1Drivers;
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

        // Add team comparison for sports that have team data
        if (chosenPlayer.team && targetPlayer.team) {
            results.team = chosenPlayer.team === targetPlayer.team ? 'Verde' : 'Rojo';
            results.chosenPlayer.team = chosenPlayer.team;
        }

        // Add number comparison for Formula 1
        if (sport === 'formula1' && chosenPlayer.number && targetPlayer.number) {
            results.number = chosenPlayer.number === targetPlayer.number ? 'Verde' : 'Rojo';
            results.numberDirection = chosenPlayer.number > targetPlayer.number ? '⬇' : '⬆';
            results.chosenPlayer.number = chosenPlayer.number;
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