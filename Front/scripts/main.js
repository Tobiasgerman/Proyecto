// Multi Wordle Main JavaScript

const API_BASE_URL = 'http://localhost:3000/api';
let currentGame = null;
let socket = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Connect to Socket.IO for autocomplete
    socket = io('http://localhost:3000');
    
    socket.on('suggestions', function(suggestions) {
        displaySuggestions(suggestions);
    });
    
    socket.on('autocompleteError', function(error) {
        console.error('Autocomplete error:', error);
    });
}

function startGame(gameType) {
    currentGame = gameType;
    
    // Hide main menu and show game screen
    document.querySelector('.game-selection').style.display = 'none';
    document.querySelector('header').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    
    // Create game screen
    createGameScreen(gameType);
    
    // Start the game
    initializeGame(gameType);
}

function createGameScreen(gameType) {
    const gameInfo = getGameInfo(gameType);
    
    const gameScreen = document.createElement('div');
    gameScreen.className = 'game-screen';
    gameScreen.innerHTML = `
        <div class="game-header">
            <button class="back-btn" onclick="goHome()">← Volver al menú</button>
            <h1 class="game-title">${gameInfo.title}</h1>
            <p>${gameInfo.description}</p>
        </div>
        
        <div class="instructions">
            <h3>Instrucciones:</h3>
            <div class="color-guide">
                <div class="color-item">
                    <div class="color-indicator correct"></div>
                    <span>Verde: Coincidencia exacta</span>
                </div>
                <div class="color-item">
                    <div class="color-indicator partial"></div>
                    <span>Amarillo: Coincidencia parcial</span>
                </div>
                <div class="color-item">
                    <div class="color-indicator incorrect"></div>
                    <span>Rojo: No coincide</span>
                </div>
            </div>
        </div>
        
        <div class="game-status">
            <div class="attempts-counter">Intentos: <span id="attempts">0</span>/5</div>
            <div id="game-message" class="game-message hidden"></div>
        </div>
        
        <div class="input-section">
            <div class="input-container">
                <input type="text" id="game-input" class="game-input" placeholder="${gameInfo.placeholder}" autocomplete="off">
                <div id="suggestions" class="suggestions"></div>
                <button id="guess-btn" class="guess-btn">Adivinar</button>
            </div>
        </div>
        
        <div id="game-grid" class="game-grid">
            ${createGameGrid(gameType)}
        </div>
    `;
    
    document.body.appendChild(gameScreen);
    
    // Add event listeners
    setupEventListeners();
}

function getGameInfo(gameType) {
    const gameInfoMap = {
        gamedle: {
            title: '🎮 Gamedle',
            description: 'Adivina el videojuego basándote en sus características',
            placeholder: 'Escribe el nombre del videojuego...'
        },
        football: {
            title: '⚽ Footble',
            description: 'Adivina el jugador de fútbol',
            placeholder: 'Escribe el nombre del jugador...'
        },
        basketball: {
            title: '🏀 Basketle',
            description: 'Adivina el jugador de basketball',
            placeholder: 'Escribe el nombre del jugador...'
        },
        formula1: {
            title: '🏎️ F1dle',
            description: 'Adivina el piloto de Fórmula 1',
            placeholder: 'Escribe el nombre del piloto...'
        },
        mundle: {
            title: '🌍 Mundle',
            description: 'Adivina el país basándote en la distancia',
            placeholder: 'Escribe el nombre del país...'
        }
    };
    
    return gameInfoMap[gameType] || gameInfoMap.gamedle;
}

function createGameGrid(gameType) {
    if (gameType === 'gamedle') {
        return `
            <div class="attribute-row">
                <div class="attribute-label">Géneros</div>
                <div id="genres" class="attribute-value">-</div>
            </div>
            <div class="attribute-row">
                <div class="attribute-label">Plataformas</div>
                <div id="platforms" class="attribute-value">-</div>
            </div>
            <div class="attribute-row">
                <div class="attribute-label">Temas</div>
                <div id="themes" class="attribute-value">-</div>
            </div>
            <div class="attribute-row">
                <div class="attribute-label">Modos de Juego</div>
                <div id="game_modes" class="attribute-value">-</div>
            </div>
            <div class="attribute-row">
                <div class="attribute-label">Perspectivas</div>
                <div id="perspectives" class="attribute-value">-</div>
            </div>
            <div class="attribute-row">
                <div class="attribute-label">Fecha de Lanzamiento</div>
                <div id="release_date" class="attribute-value">-</div>
            </div>
            <div class="attribute-row">
                <div class="attribute-label">Desarrolladores</div>
                <div id="developers" class="attribute-value">-</div>
            </div>
            <div class="attribute-row">
                <div class="attribute-label">Motor</div>
                <div id="engines" class="attribute-value">-</div>
            </div>
        `;
    } else if (gameType === 'mundle') {
        return `
            <div class="attribute-row">
                <div class="attribute-label">Distancia</div>
                <div id="distance" class="attribute-value">-</div>
            </div>
            <div class="attribute-row">
                <div class="attribute-label">Dirección</div>
                <div id="direction" class="attribute-value">-</div>
            </div>
        `;
    } else {
        // Sports games
        return `
            <div class="attribute-row">
                <div class="attribute-label">Nombre</div>
                <div id="name" class="attribute-value">-</div>
            </div>
            <div class="attribute-row">
                <div class="attribute-label">Nacionalidad</div>
                <div id="nationality" class="attribute-value">-</div>
            </div>
            <div class="attribute-row">
                <div class="attribute-label">Posición</div>
                <div id="position" class="attribute-value">-</div>
            </div>
            <div class="attribute-row">
                <div class="attribute-label">Fecha de Nacimiento</div>
                <div id="birthDate" class="attribute-value">-</div>
            </div>
            ${gameType === 'formula1' ? '<div class="attribute-row"><div class="attribute-label">Equipo</div><div id="team" class="attribute-value">-</div></div>' : ''}
        `;
    }
}

function setupEventListeners() {
    const input = document.getElementById('game-input');
    const guessBtn = document.getElementById('guess-btn');
    const suggestions = document.getElementById('suggestions');
    
    // Input event for autocomplete
    input.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        if (query.length > 1) {
            socket.emit('autocomplete', query, currentGame);
        } else {
            hideSuggestions();
        }
    });
    
    // Guess button click
    guessBtn.addEventListener('click', makeGuess);
    
    // Enter key to guess
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            makeGuess();
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestions.contains(e.target)) {
            hideSuggestions();
        }
    });
}

function displaySuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('suggestions');
    
    if (!suggestions || suggestions.length === 0) {
        hideSuggestions();
        return;
    }
    
    suggestionsContainer.innerHTML = suggestions.map(suggestion => 
        `<div class="suggestion-item" onclick="selectSuggestion('${suggestion}')">${suggestion}</div>`
    ).join('');
    
    suggestionsContainer.style.display = 'block';
}

function hideSuggestions() {
    const suggestionsContainer = document.getElementById('suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

function selectSuggestion(suggestion) {
    document.getElementById('game-input').value = suggestion;
    hideSuggestions();
}

async function initializeGame(gameType) {
    try {
        let endpoint;
        if (gameType === 'gamedle') {
            endpoint = '/gamedle/start';
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ knownMode: true })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to start game');
            }
            
            showMessage(data.message, 'info');
        } else if (gameType === 'mundle') {
            // Mundle doesn't need initialization, just get a random country
            const response = await fetch(`${API_BASE_URL}/mundle/random-country`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to get random country');
            }
            
            window.targetCountry = data.name;
            showMessage('¡Adivina el país! 🌍', 'info');
            return;
        } else {
            endpoint = `/sports/${gameType}/start`;
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to start game');
            }
            
            showMessage(data.message, 'info');
        }
    } catch (error) {
        console.error('Error initializing game:', error);
        showMessage('Error al inicializar el juego. Por favor, intenta de nuevo.', 'error');
    }
}

async function makeGuess() {
    const input = document.getElementById('game-input');
    const guess = input.value.trim();
    
    if (!guess) {
        showMessage('Por favor, escribe tu respuesta.', 'error');
        return;
    }
    
    const guessBtn = document.getElementById('guess-btn');
    guessBtn.disabled = true;
    guessBtn.innerHTML = '<div class="loading"></div>';
    
    try {
        let endpoint, body;
        
        if (currentGame === 'gamedle') {
            endpoint = '/gamedle/guess';
            body = { gameName: guess };
        } else if (currentGame === 'mundle') {
            endpoint = '/mundle/distance';
            body = { chosenCountry: guess, targetCountry: window.targetCountry };
        } else {
            endpoint = `/sports/${currentGame}/guess`;
            body = { playerName: guess };
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to process guess');
        }
        
        updateGameState(data);
        input.value = '';
        hideSuggestions();
        
    } catch (error) {
        console.error('Error making guess:', error);
        showMessage(error.message || 'Error al procesar la respuesta.', 'error');
    } finally {
        guessBtn.disabled = false;
        guessBtn.innerHTML = 'Adivinar';
    }
}

function updateGameState(data) {
    // Update attempts counter
    if (data.attempts !== undefined) {
        document.getElementById('attempts').textContent = data.attempts;
    }
    
    // Check for win/loss conditions
    if (data.won) {
        showMessage(data.message || '¡Felicidades! ¡Has ganado!', 'success');
        disableInput();
        return;
    }
    
    if (data.gameOver) {
        showMessage(data.message || '¡Juego terminado!', 'error');
        disableInput();
        return;
    }
    
    // Update game grid based on game type
    if (currentGame === 'mundle') {
        updateMundleGrid(data);
    } else if (currentGame === 'gamedle') {
        updateGamedleGrid(data);
    } else {
        updateSportsGrid(data);
    }
}

function updateGamedleGrid(data) {
    const attributes = ['genres', 'platforms', 'themes', 'game_modes', 'perspectives', 'release_date', 'developers', 'engines'];
    
    attributes.forEach(attr => {
        const element = document.getElementById(attr);
        if (data[attr]) {
            const className = data[attr] === 'Verde' ? 'correct' : data[attr] === 'Amarillo' ? 'partial' : 'incorrect';
            element.className = `attribute-value ${className}`;
            
            let content = data.chosenGame || '-';
            if (attr === 'release_date' && data.release_date_direction) {
                content += ` ${data.release_date_direction}`;
            }
            
            element.innerHTML = content;
        }
    });
}

function updateSportsGrid(data) {
    const attributes = ['name', 'nationality', 'position', 'birthDate'];
    if (currentGame === 'formula1') {
        attributes.push('team');
    }
    
    attributes.forEach(attr => {
        const element = document.getElementById(attr);
        if (data[attr]) {
            const className = data[attr] === 'Verde' ? 'correct' : 'incorrect';
            element.className = `attribute-value ${className}`;
            
            let content = data.chosenPlayer || '-';
            if (attr === 'birthDate' && data.birthDateDirection) {
                content += ` ${data.birthDateDirection}`;
            }
            
            element.innerHTML = content;
        }
    });
}

function updateMundleGrid(data) {
    const distanceElement = document.getElementById('distance');
    const directionElement = document.getElementById('direction');
    
    if (data.distance !== undefined) {
        distanceElement.className = 'attribute-value';
        distanceElement.innerHTML = `${data.distance} km`;
        
        directionElement.className = 'attribute-value';
        directionElement.innerHTML = data.direction || '-';
    }
}

function showMessage(message, type) {
    const messageElement = document.getElementById('game-message');
    messageElement.textContent = message;
    messageElement.className = `game-message ${type}`;
    messageElement.classList.remove('hidden');
    
    // Auto-hide info messages after 3 seconds
    if (type === 'info') {
        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, 3000);
    }
}

function disableInput() {
    document.getElementById('game-input').disabled = true;
    document.getElementById('guess-btn').disabled = true;
}

function goHome() {
    // Remove game screen
    const gameScreen = document.querySelector('.game-screen');
    if (gameScreen) {
        gameScreen.remove();
    }
    
    // Show main menu
    document.querySelector('.game-selection').style.display = 'block';
    document.querySelector('header').style.display = 'block';
    document.querySelector('footer').style.display = 'block';
    
    // Reset game state
    currentGame = null;
    window.targetCountry = null;
}