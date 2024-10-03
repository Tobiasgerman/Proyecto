const filas = document.querySelectorAll('.row');
var finalDiv = document.getElementById("final");
let filaActual = 0;
let letraActual = 0;


let juegoTerminado = false;
let marcaCorrecta = '';
let mensajeFinal = '';


let listamarcas = [];


fetch('marcas.txt') // Extra un valor de marcas.txt
    .then(response => response.text())
    .then(data => {
        listamarcas = data.split('\n').map(marca => marca.trim().toUpperCase());
        marcaCorrecta = listamarcas[Math.floor(Math.random() * listamarcas.length)]; // Lo hace de manera random
        console.log(`marca correcta: ${marcaCorrecta}`); // console.log para controlar errores
    });


const confirmarmarca = () => {
    if (letraActual != 5) return;


    const letras = filas[filaActual].querySelectorAll('.letra');
    let marcaIngresada = Array.from(letras).map(letter => letter.textContent).join('');


    if (!listamarcas.includes(marcaIngresada)) {
        mensajeFinal = `marca no válida`;
        finalDiv.innerHTML = mensajeFinal;
        return;
    }


    let marcaCorrectaTemp = marcaCorrecta.split('');
    let sum = 0;


    // Primero manejamos los casos en los que las letras están en la posición correcta
    letras.forEach((letter, index) => {
        const tecla = document.querySelector(`.key[data-key="${letter.textContent.toLowerCase()}"]`);


        if (letter.textContent === marcaCorrecta[index]) {
            letter.style.backgroundColor = 'green';
            if (tecla) tecla.style.backgroundColor = 'green';
            sum++;
            marcaCorrectaTemp[index] = null; // Remover la letra correcta para evitar duplicados
        }
    });


    // Luego manejamos las letras que están en la marca pero en otra posición
    letras.forEach((letter, index) => {
        if (letter.style.backgroundColor !== 'green') { // Solo comprobar letras que no están en la posición correcta
            const tecla = document.querySelector(`.key[data-key="${letter.textContent.toLowerCase()}"]`);
            let pos = marcaCorrectaTemp.indexOf(letter.textContent);
            if (pos !== -1) {
                letter.style.backgroundColor = 'yellow';
                if (tecla && tecla.style.backgroundColor !== 'green') {
                    tecla.style.backgroundColor = 'yellow';
                }
                marcaCorrectaTemp[pos] = null; // Remover la letra para evitar duplicados
            } else {
                letter.style.backgroundColor = 'gray';
                if (tecla) tecla.style.backgroundColor = 'gray';
            }
        }
    });


    if (sum == 5) {
        mensajeFinal = `¡Felicidades! Has descubierto la marca correcta: ${marcaCorrecta}.`;
        finalDiv.innerHTML = mensajeFinal;
        juegoTerminado = true;
    } else if (filaActual == 5) {
        mensajeFinal = `Has alcanzado el número máximo de intentos. La marca correcta era: ${marcaCorrecta}`;
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
        confirmarmarca();
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
            confirmarmarca();
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
    confirmarMarca();
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
