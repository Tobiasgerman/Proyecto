<<<<<<< HEAD
async function obtenerPaises() {
=======
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
const suggestionsContainer = document.getElementById('suggestions-container');
const input = document.getElementById('pais');
const guessButton = document.getElementById('submit');
const socket = io("http://localhost:3000");
const URL = "http://localhost:3000";

async function obtenerPaises() { 
>>>>>>> 6e61083fa9a8828a2415fd2b94be8f940055bb0e
    const response = await fetch('/paises');
    return response.json();
}

async function obtenerPaisAleatorio() {
    const response = await fetch('/pais-aleatorio');
    return response.json();
}

async function enviarRespuesta(paisElegido, paisAleatorio) {
    const response = await fetch('/distancia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paisElegido, paisAleatorio })
    });
    return response.json();
}

async function jugar() {
    const paises = await obtenerPaises();
    const paisAleatorio = await obtenerPaisAleatorio();
<<<<<<< HEAD
=======
    console.log(paisAleatorio);
    const guessRows = document.querySelectorAll('.guess-row');
    let intento = 0; 
    document.getElementById("imagen").src = paisAleatorio.imagen;
>>>>>>> 6e61083fa9a8828a2415fd2b94be8f940055bb0e

    document.getElementById('submit').addEventListener('click', async () => {
        const paisElegido = document.getElementById('pais').value;
        if (paisElegido.toLowerCase() === paisAleatorio.translations.spa.common.toLowerCase()) {
            alert(`¡Ganaste! El país era ${paisAleatorio.translations.spa.common}`);
        } else {
            const resultado = await enviarRespuesta(paisElegido, paisAleatorio);
            alert(`El país aleatorio está a ${resultado.distancia} km y se encuentra en dirección ${resultado.direccion}`);
        }
    });
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
document.addEventListener('click', (event) => {
    if (event.target !== input) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'none';
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


window.onload = jugar;