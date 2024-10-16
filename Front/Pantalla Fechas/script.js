const filas = document.querySelectorAll('.row');
var finalDiv = document.getElementById("final");
let filaActual = 0;
let letraActual = 0;
let juegoTerminado = false;
let fechaCorrecta = '';
let mensajeFinal = '';
let listaFechas = [];

// Cargar fechas desde el archivo
fetch('fechas.txt')
    .then(response => response.text())
    .then(data => {
        listaFechas = data.split('\n').map(fecha => fecha.trim());
        fechaCorrecta = listaFechas[Math.floor(Math.random() * listaFechas.length)];
        console.log(`Fecha correcta: ${fechaCorrecta}`);
    });

// Función para confirmar la fecha ingresada
const confirmarFecha = () => {
    if (juegoTerminado) return; // No continuar si el juego ya terminó

    const letras = filas[filaActual].querySelectorAll('.letra');
    if (letraActual !== 10) return; // No enviar si no hay una fecha completa (10 caracteres)
    
    let fechaIngresada = Array.from(letras).map(letter => letter.textContent).join('');

    if (listaFechas.indexOf(fechaIngresada) === -1) {
        mensajeFinal = `Esta fecha no está incluida en el diccionario. Recuerda que se escribe en formato XX-XX-XXXX.`;
        finalDiv.innerHTML = mensajeFinal;
        return;
    }

    // Comparar cada parte de la fecha
    let diaCorrecto = fechaCorrecta.slice(0, 2);
    let mesCorrecto = fechaCorrecta.slice(3, 5);
    let añoCorrecto = fechaCorrecta.slice(6, 10);

    let diaIngresado = fechaIngresada.slice(0, 2);
    let mesIngresado = fechaIngresada.slice(3, 5);
    let añoIngresado = fechaIngresada.slice(6, 10);

    let sum = 0;
    const compararYAsignarColor = (valorIngresado, valorCorrecto, index, esParteCorrecta, correctosUsados) => {
        const letter = letras[index];
        letter.classList.add('checked');
        const tecla = document.querySelector(`.key[data-key="${letter.textContent.toLowerCase()}"]`);

        if (valorIngresado === valorCorrecto) {
            letter.style.backgroundColor = 'green';
            if (tecla) tecla.style.backgroundColor = 'green';
            sum++;
            correctosUsados.push(valorIngresado); 
        } else if (esParteCorrecta && correctosUsados.indexOf(valorIngresado) === -1) {
            letter.style.backgroundColor = 'yellow';
            if (tecla && tecla.style.backgroundColor !== 'green') {
                tecla.style.backgroundColor = 'yellow';
            }
        } else {
            letter.style.backgroundColor = 'gray';
            if (tecla) tecla.style.backgroundColor = 'gray';
        }
    };

    let correctosUsados = [];
    compararYAsignarColor(diaIngresado[0], diaCorrecto[0], 0, diaCorrecto.indexOf(diaIngresado[0]) !== -1, correctosUsados);
    compararYAsignarColor(diaIngresado[1], diaCorrecto[1], 1, diaCorrecto.indexOf(diaIngresado[1]) !== -1, correctosUsados);
    compararYAsignarColor(mesIngresado[0], mesCorrecto[0], 3, mesCorrecto.indexOf(mesIngresado[0]) !== -1, correctosUsados);
    compararYAsignarColor(mesIngresado[1], mesCorrecto[1], 4, mesCorrecto.indexOf(mesIngresado[1]) !== -1, correctosUsados);
    compararYAsignarColor(añoIngresado[0], añoCorrecto[0], 6, añoCorrecto.indexOf(añoIngresado[0]) !== -1, correctosUsados);
    compararYAsignarColor(añoIngresado[1], añoCorrecto[1], 7, añoCorrecto.indexOf(añoIngresado[1]) !== -1, correctosUsados);
    compararYAsignarColor(añoIngresado[2], añoCorrecto[2], 8, añoCorrecto.indexOf(añoIngresado[2]) !== -1, correctosUsados);
    compararYAsignarColor(añoIngresado[3], añoCorrecto[3], 9, añoCorrecto.indexOf(añoIngresado[3]) !== -1, correctosUsados);

    if (fechaIngresada === '11-09-2001') /* atentado torres gemelas */ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="descarga(torres-gemelas).png" alt="Imagen" />';
    }
    if (fechaIngresada === '04-08-0070') /* destrucción del primer beit hamikdash */ {
       let imagen = document.getElementById('imagen-easter-egg');
       imagen.innerHTML = '<img src="descarga(beit-hamikdash-caida).png" alt="Imagen" />';
    }
    if (fechaIngresada === '06-08-1945') /* hiroshima */ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="imagen(hiroshima).png" alt="Imagen" />';
    }
    if (fechaIngresada === '09-08-1945') /* nagasaki */ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="descarga(nagasaki).png" alt="Imagen" />';
    }
    if (fechaIngresada === '23-08-2008') /* cumple gandel */ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="cumple(gandel).png" alt="Imagen" />';
    }
    if (fechaIngresada === '23-06-2009') /* cumple manu */ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="cumple(manu).png" alt="Imagen" />';
    }
    if (fechaIngresada === '22-12-2008') /* cumple tobi  */ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="cumple(tobi).png" alt="Imagen" />';
    }
    if (fechaIngresada === '09-01-2009') /* cumple oneto */ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="cumple(oneto).png" alt="Imagen" />';
    }
    if (fechaIngresada === '16-04-2009') /* cumple pipa */ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="cumple(pipa).png" alt="Imagen" />';
    }
    if (fechaIngresada === '07-02-2023') /* creacion de skibidi toilet */ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="descarga (skibidi-toilet).png" alt="Imagen" />';
    }
    if (fechaIngresada === '26-09-2008') /* cumple sakito */ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="cumple(sakito).png" alt="Imagen" />';
    }
    if (fechaIngresada === '01-12-2019') /* creacion de aieka monta*/ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="descarga(aieka).png" alt="Imagen" />';
    }
    if (fechaIngresada === '26-04-1986') /* chernobyl */ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="descarga(chernobyl).png" alt="Imagen" />';
    }
    if (fechaIngresada === '03-08-2008') /* cumple fogo */ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="cumple(fogo).png" alt="Imagen" />';
    }
    if (fechaIngresada === '01-09-1939') /* invasion a polonia */ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="descarga(invasion-polonia).png" alt="Imagen" />';
    }
    if (fechaIngresada === '10-05-2009') /* cumple simi */ {
        let imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="cumple(simi).png" alt="Imagen" />'; 
    }
    
    
    if (fechaIngresada === fechaCorrecta) {
        mensajeFinal = `¡Felicidades! Has descubierto la fecha correcta: ${fechaCorrecta}.`;
        finalDiv.innerHTML = mensajeFinal;
        juegoTerminado = true;
    } else {
        filaActual++;
        letraActual = 0;
        if (filaActual === 6) {
            mensajeFinal = `Has alcanzado el número máximo de intentos. La fecha correcta era: ${fechaCorrecta}.`;
            finalDiv.innerHTML = mensajeFinal;
            juegoTerminado = true;
        }
    }
};

// Control de eventos del teclado
document.addEventListener('keydown', e => {
    if (juegoTerminado) return;

    const letras = filas[filaActual].querySelectorAll('.letra');
    
    if (e.key === 'Enter') {
        confirmarFecha();
    } else if (e.key === 'Backspace' && letraActual > 0) {
        letraActual--;
        letras[letraActual].textContent = '';
    } else if (e.key.match(/^[0-9\-]$/) && letraActual < 10) {
        letras[letraActual].textContent = e.key;
        letraActual++;
    }
});

// Control de los botones en pantalla
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
        } else if (letraActual < 10 && key.match(/^[0-9\-]$/)) {
            letras[letraActual].textContent = key;
            letraActual++;
        }
    });
});

// Botón "Enviar"
const botonEnter = document.getElementById('enviar');
botonEnter.addEventListener("click", function() {
    confirmarFecha();
});

// Botón "Borrar"
const botonBorrar = document.getElementById('borrar');
botonBorrar.addEventListener("click", function() {
    const letras = filas[filaActual].querySelectorAll('.letra');
    if (letraActual > 0) {
        letraActual--;
        letras[letraActual].textContent = '';
    }
});

document.getElementById('final').style.fontSize = "30px";