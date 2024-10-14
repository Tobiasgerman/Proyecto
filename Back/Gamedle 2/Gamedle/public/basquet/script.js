import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const input = document.querySelector('.parteinput input');
const guessButton = document.querySelector('.parteinput button');
const suggestionsContainer = document.getElementById('suggestions-container');
const squares = document.querySelectorAll('.squares-container .item div');
const socket = io("http://localhost:3000");
const URL = "http://localhost:3000";
let username;
async function iniciarJuego() {
    juego = prompt("Que queres jugar (1.Basquet , 2. Tennis , 3. Futbol , 4. Formula 1 , 5. Celebridades)");
    switch (juego){
        case "1":
            iniciarJuego();
            break;
        case "2":
            document.location.href("./tenis/tennis.html");
            break;
        case "3":
            iniciarJuegoFutbol();
            break;
        case "4":
            iniciarJuegoFormula1();
            break;
        case "5":
            iniciarJuegoCelebridades();
            break;
        default:
            alert("Opcion invalida");
            iniciarJuego();
            break;
    }
    username = prompt('Ingresa tu nombre de usuario:');
    try {
        const modoConocido = prompt('Elige el modo de juego:\n1. Juegos Conocidos\n2. Todos los Juegos') === '1';

        const iniciarJuegoResponse = await fetch(`${URL}/iniciarJuegoBasquet`, {
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
        const response = await fetch(`${URL}/adivinarJuegoBasquet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: gameName})
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
            console.log(data.nombre);
            updateSquareColor(squares[0], data.nombre);
            console.log(data.pais);
            updateSquareColor(squares[1], data.pais);
            console.log(data.equipo);
            updateSquareColor(squares[2], data.equipo);
            console.log(data.camiseta);
            updateSquareColor(squares[3], data.camiseta);
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
        socket.emit('autocomplete', query, 'basquet');
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
