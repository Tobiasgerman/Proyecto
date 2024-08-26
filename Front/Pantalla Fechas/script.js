const filas = document.querySelectorAll('.row');
var finalDiv = document.getElementById("final");
let filaActual = 0;
let letraActual = 0;
let juegoTerminado = false;
let palabraCorrecta = '';
let mensajeFinal = '';
let listaFechas = [];

// Cargar lista de fechas desde un archivo o de la fuente generada previamente
fetch('fechas.txt')
    .then(response => response.text())
    .then(data => {
        listaFechas = data.split('\n').map(fecha => fecha.trim());
        palabraCorrecta = listaFechas[Math.floor(Math.random() * listaFechas.length)];
        console.log(`Fecha correcta: ${palabraCorrecta}`);
    });

// Función para confirmar la fecha ingresada
const confirmarFecha = () => {
    if (letraActual != 10) return;  // Solo aceptar si tiene 10 caracteres (DD-MM-YYYY)

    const letras = filas[filaActual].querySelectorAll('.letra');
    let fechaIngresada = Array.from(letras).map(letter => letter.textContent).join('');

    if (!listaFechas.includes(fechaIngresada)) {
        alert('La fecha ingresada no existe en el diccionario.');
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
        } else if (palabraCorrecta.includes(letter.textContent) && palabraCorrecta.indexOf(letter.textContent) !== index) {
            letter.style.backgroundColor = 'yellow';
            if (tecla && tecla.style.backgroundColor !== 'green') {
                tecla.style.backgroundColor = 'yellow';
            }
        } else {
            letter.style.backgroundColor = 'gray';
            if (tecla) tecla.style.backgroundColor = 'gray';
        }
    });

    if (sum == 10) {  // Si todos los caracteres coinciden
        mensajeFinal = `¡Felicidades! Has descubierto la fecha correcta: ${palabraCorrecta}.`;
        finalDiv.innerHTML = mensajeFinal;
        juegoTerminado = true;
    } else if (filaActual == 5) {  // Número máximo de intentos
        mensajeFinal = `Has alcanzado el número máximo de intentos. La fecha correcta era: ${palabraCorrecta}`;
        finalDiv.innerHTML = mensajeFinal;
        juegoTerminado = true;
    } else {
        filaActual++;
        letraActual = 0;
    }
};

// Manejar el ingreso de teclas del teclado
document.addEventListener('keydown', e => {
    if (juegoTerminado) return;

    const letras = filas[filaActual].querySelectorAll('.letra');

    if (e.key === 'Enter') {
        confirmarFecha();
    } else if (e.key === 'Backspace' && letraActual > 0) {
        letraActual--;
        letras[letraActual].textContent = '';
    } else if (e.key.match(/^[0-9\-]$/) && letraActual < 10) {  // Solo permitir números y guiones
        letras[letraActual].textContent = e.key;
        letraActual++;
    }
});

// Manejar los botones en pantalla
const teclas = document.querySelectorAll('.key');

teclas.forEach(tecla => {
    tecla.addEventListener('click', () => {
        if (juegoTerminado) return;

        const letras = filas[filaActual].querySelectorAll('.letra');
        const key = tecla.dataset.key;

        if (key === 'enter') {
            confirmarFecha();
        } else if (key === 'backspace' && letraActual > 0) {
            letraActual--;
            letras[letraActual].textContent = '';
        } else if (letraActual < 10 && key.match(/^[0-9\-]$/)) {  // Solo números y guiones
            letras[letraActual].textContent = key.toUpperCase();
            letraActual++;
        }
    });
});

const botonEnter = document.getElementById('enviar');
botonEnter.addEventListener("click", function() {
    confirmarFecha();
});

const botonBorrar = document.getElementById('borrar');
botonBorrar.addEventListener("click", function() {
    const letras = filas[filaActual].querySelectorAll('.letra');
    if (letraActual > 0) {
        letraActual--;
        letras[letraActual].textContent = '';
    }    
});
