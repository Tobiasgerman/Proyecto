const filas = document.querySelectorAll('.row');
var finalDiv = document.getElementById("final");
let filaActual = 0;
let letraActual = 0;

let juegoTerminado = false;
let palabraCorrecta = '';
let mensajeFinal = '';

let listaPalabras = [];


fetch('palabras.txt')
    .then(response => response.text())
    .then(data => {
        listaPalabras = data.split('\n').map(palabra => palabra.trim().toUpperCase());
        palabraCorrecta = listaPalabras[Math.floor(Math.random() * listaPalabras.length)];
        console.log(`Palabra correcta: ${palabraCorrecta}`);
    });

const confirmarPalabra = () => {
    if (letraActual != 5) return;

    const letras = filas[filaActual].querySelectorAll('.letra');
    let palabraIngresada = Array.from(letras).map(letter => letter.textContent).join('');

    if (!listaPalabras.includes(palabraIngresada)) {
        alert('La palabra ingresada no existe en el diccionario.');
        return;
    }

    let sum = 0;
    letras.forEach((letter, index) => {
        letter.classList.add('checked');
        const tecla = document.querySelector(`.key[data-key="${letter.textContent.toLowerCase()}"]`);
        if (letter.textContent === palabraCorrecta[index]) {
            letter.style.backgroundColor = 'green';
            if (tecla) tecla.style.backgroundColor = 'green';
            sum++;
        } else if (palabraCorrecta.includes(letter.textContent)) {
            letter.style.backgroundColor = 'yellow';
            if (tecla && tecla.style.backgroundColor !== 'green') {
                tecla.style.backgroundColor = 'yellow';
            }
        } else {
            letter.style.backgroundColor = 'gray';
            if (tecla) tecla.style.backgroundColor = 'gray';
        }
    });

    if (sum == 5) {
        mensajeFinal = `¡Felicidades! Has descubierto la palabra correcta: ${palabraCorrecta}.`;
        finalDiv.innerHTML = mensajeFinal;
        juegoTerminado = true;
    } else if (filaActual == 5) {
        mensajeFinal = `Has alcanzado el número máximo de intentos. La palabra correcta era: ${palabraCorrecta}`;
        finalDiv.innerHTML = mensajeFinal;
        juegoTerminado = true;
    } else {
        filaActual++;
        letraActual = 0;
    }
};

document.addEventListener('keydown', e => {
    if (juegoTerminado) return;
    const letras = filas[filaActual].querySelectorAll('.letra');
    if (e.key === 'Enter') {
        confirmarPalabra();
    } else if (e.key === 'Backspace' && letraActual > 0) {
        letraActual--;
        letras[letraActual].textContent = '';
    } else if (e.key.match(/^[a-zñ]$/i) && letraActual < 5) {
        letras[letraActual].textContent = e.key.toUpperCase();
        letraActual++;
    }
});

const teclas = document.querySelectorAll('.key');

teclas.forEach(tecla => {
    tecla.addEventListener('click', () => {
        if (juegoTerminado) return;
        const letras = filas[filaActual].querySelectorAll('.letra');

        if (tecla.dataset.key === 'enter') {
            confirmarPalabra();
        } else if (tecla.dataset.key === 'backspace' && letraActual > 0) {
            letraActual--;
            letras[letraActual].textContent = '';
        } else if (letraActual < 5) {
            letras[letraActual].textContent = tecla.dataset.key.toUpperCase();
            letraActual++;
        }
    });
});
const botonEnter = document.getElementById('enviar');
botonEnter.addEventListener("click", function() {
    confirmarPalabra();
});

const botonBorrar = document.getElementById('borrar');
botonBorrar.addEventListener("click", function() {
    const letras = filas[filaActual].querySelectorAll('.letra');
    if (letraActual > 0) {
        letraActual--;
        letras[letraActual].textContent = '';
    }    
});
