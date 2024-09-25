import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const input = document.querySelector('.parteinput input');
const guessButton = document.querySelector('.parteinput button');
const suggestionsContainer = document.getElementById('suggestions-container');
const squares = document.querySelectorAll('.squares-container .item div');
const socket = io("http://localhost:3000");
const URL = "http://localhost:3000";
let username;
async function iniciarJuego() {
    username = prompt('Ingresa tu nombre de usuario:');
    try {
        const modoConocido = prompt('Elige el modo de juego:\n1. Juegos Conocidos\n2. Todos los Juegos') === '1';

        const iniciarJuegoResponse = await fetch(`${URL}/iniciarJuego`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ modoConocido })
        });

        const iniciarJuegoData = await iniciarJuegoResponse.json();
        if (iniciarJuegoData.error) {
            alert(iniciarJuegoData.error);
        } else {
            alert(iniciarJuegoData.message);
        }
    } catch (error) {
        console.error('Error al iniciar el juego:', error);
    }
}

async function adivinarJuego() {
    const gameName = input.value.trim();

    if (gameName === '') {
        alert('Por favor, ingresa el nombre de un juego.');
        return;
    }

    try {
        const response = await fetch(`${URL}/adivinarJuego`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ juego: gameName , username})
        });

        const data = await response.json();
        if (data.error) {
            alert(data.error);
        }
        else if(data.message) {
            alert(data.message);
        if(data.timeTaken){
            alert(`Tu tiempo: ${data.timeTaken} segundos. Mejor tiempo: ${data.bestTime} segundos.`)

            }
        }


        if (data.error) {
            alert(data.error);
        } else if (data.message) {
            alert(data.message);
        } else {
            console.log(data.generos);
            updateSquareColor(squares[0], data.generos);
            console.log(data.plataformas);
            updateSquareColor(squares[1], data.plataformas);
            console.log(data.temas);
            updateSquareColor(squares[2], data.temas);
            console.log(data.modosDeJuego);
            updateSquareColor(squares[3], data.modosDeJuego);
            console.log(data.perspectivas);
            updateSquareColor(squares[4], data.perspectivas);
            console.log(data.fechaLanzamiento);
            updateSquareColor(squares[5], data.fechaLanzamiento);
            updateSquareColor(squares[6], data.desarrolladores);
            updateSquareColor(squares[7], data.motor);
            input.value = '';
        }
    } catch (error) {
        console.error('Error al adivinar el juego:', error);
    }
}

function updateSquareColor(square, status) {
    square.classList.remove('rojo', 'amarillo', 'verde');
    if (status === 'Rojo') {
        square.style.backgroundColor = 'red';
    } else if (status === 'Amarillo') {
        square.style.backgroundColor = 'yellow';
    } else if (status === 'Verde') {
        square.style.backgroundColor = 'green';
    }
}

document.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        guessButton.click();
    }
});

input.addEventListener('input', () => {
    const query = input.value.trim();
    if (query) {
        socket.emit('autocomplete', query);
        console.log('Emitiendo:', query);
    }
});

socket.on('suggestions', (suggestions) => {
    suggestionsContainer.innerHTML = '';
    console.log('Recibiendo:', suggestions);
    suggestionsContainer.style.display = 'block';
    suggestions.forEach(suggestion => {
        const suggestionElement = document.createElement('div');
        suggestionElement.textContent = suggestion;
        suggestionElement.classList.add('suggestion-item');
        suggestionElement.addEventListener('click', () => {
            input.value = suggestion;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
        });
        suggestionsContainer.appendChild(suggestionElement);
    });
});

iniciarJuego();

guessButton.addEventListener('click', adivinarJuego);
