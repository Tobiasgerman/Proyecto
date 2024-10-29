import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const input = document.querySelector('.parteinput input');
const guessButton = document.querySelector('.parteinput button');
const suggestionsContainer = document.getElementById('suggestions-container');
const squares = document.querySelectorAll('.squares-container .item div');
const socket = io("http://localhost:3000");
const URL = "http://localhost:3000";



async function iniciarJuego() {
    try {
        const iniciarJuegoResponse = await fetch(`${URL}/iniciarJuegoBasquet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
        const response = await fetch(`${URL}/adivinarJugadorBasquet`, {
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
document.addEventListener("click", () =>{
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.style.display = 'none';
});

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
    if(input.innerHTML == ""){
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'none';
    }
});

socket.on('suggestions', (suggestions) => {
    if (suggestions && suggestions != undefined && suggestions != [] && suggestions != null & suggestions != ""){
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
} else{
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.style.display = 'none';
}

});

iniciarJuego();

guessButton.addEventListener('click', adivinarJuego);
