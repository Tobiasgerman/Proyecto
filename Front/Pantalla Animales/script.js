const filas = document.querySelectorAll('.row');
var finalDiv = document.getElementById("final");
let filaActual = 0;
let letraActual = 0;
let juegoTerminado = false;
let animalcorrecto = '';
let mensajeFinal = '';


let listaanimales = [];


fetch('animales.txt') // Extra un valor de animales.txt
    .then(response => response.text())
    .then(data => {
        listaanimales = data.split('\n').map(animal => animal.trim().toUpperCase());
        animalcorrecto = listaanimales[Math.floor(Math.random() * listaanimales.length)]; // Lo hace de manera random
        console.log(`Animal correcto: ${animalcorrecto}`); // console.log para controlar errores
    });


const confirmaranimal = () => {
    if (letraActual != 5) return;

    const letras = filas[filaActual].querySelectorAll('.letra');
    let animalIngresado = Array.from(letras).map(letter => letter.textContent).join('');


    if (!listaanimales.includes(animalIngresado)) {
        mensajeFinal = `animal no válida`;
        finalDiv.innerHTML = mensajeFinal;
        return;
    }


    let animalcorrectoTemp = animalcorrecto.split('');
    let sum = 0;


    // Primero manejamos los casos en los que las letras están en la posición correcto
    letras.forEach((letter, index) => {
        const tecla = document.querySelector(`.key[data-key="${letter.textContent.toLowerCase()}"]`);


        if (letter.textContent === animalcorrecto[index]) {
            letter.style.backgroundColor = 'green';
            if (tecla) tecla.style.backgroundColor = 'green';
            sum++;
            animalcorrectoTemp[index] = null; // Remover la letra correcto para evitar duplicados
        }
    });


    // Luego manejamos las letras que están en la animal pero en otra posición
    letras.forEach((letter, index) => {
        if (letter.style.backgroundColor !== 'green') { // Solo comprobar letras que no están en la posición correcto
            const tecla = document.querySelector(`.key[data-key="${letter.textContent.toLowerCase()}"]`);
            let pos = animalcorrectoTemp.indexOf(letter.textContent);
            if (pos !== -1) {
                letter.style.backgroundColor = 'yellow';
                if (tecla && tecla.style.backgroundColor !== 'green') {
                    tecla.style.backgroundColor = 'yellow';
                }
                animalcorrectoTemp[pos] = null; // Remover la letra para evitar duplicados
            } else {
                letter.style.backgroundColor = 'gray';
                if (tecla) tecla.style.backgroundColor = 'gray';
            }
        }
    });

    if (sum == 5) {
        mensajeFinal = `¡Felicidades! Has descubierto la animal correcto: ${animalcorrecto}.`;
        finalDiv.innerHTML = mensajeFinal;
        juegoTerminado = true;
    } else if (filaActual == 5) {
        mensajeFinal = `Has alcanzado el número máximo de intentos. La animal correcto era: ${animalcorrecto}`;
        finalDiv.innerHTML = mensajeFinal;
        juegoTerminado = true;
    } else {
        filaActual++;
        letraActual = 0;
    }
};

// Evento para borrar el mensaje con el teclado (Backspace o Delete)
document.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
        finalDiv.innerHTML = '';  // Limpia el contenido del mensaje
    }
});

document.addEventListener('keydown', e => {
    if (juegoTerminado) return;
    const letras = filas[filaActual].querySelectorAll('.letra');
    if (e.key === 'Enter') {
        confirmaranimal();
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
            confirmaranimal();
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
    confirmaranimal();
});

const botonBorrar = document.getElementById('borrar');
botonBorrar.addEventListener("click", function() {
    const letras = filas[filaActual].querySelectorAll('.letra');
    if (letraActual > 0) {
        letraActual--;
        letras[letraActual].textContent = '';
    }
    finalDiv.innerHTML = '';  // Limpia el contenido del mensaje
});
