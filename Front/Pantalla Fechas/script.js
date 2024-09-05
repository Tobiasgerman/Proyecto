const filas = document.querySelectorAll('.row');
var finalDiv = document.getElementById("final");
let filaActual = 0;
let letraActual = 0;
let juegoTerminado = false;
let fechaCorrecta = '';
let mensajeFinal = '';
let listaFechas = [];

fetch('fechas.txt')
    .then(response => response.text())
    .then(data => {
        listaFechas = data.split('\n').map(fecha => fecha.trim());
        fechaCorrecta = listaFechas[Math.floor(Math.random() * listaFechas.length)];
        console.log(`Fecha correcta: ${fechaCorrecta}`);
    });

const confirmarFecha = () => {
    if (finalDiv.innerHTML !== '' || document.getElementById('imagen-easter-egg').innerHTML !== '') {
        finalDiv.innerHTML = '';
        document.getElementById('imagen-easter-egg').innerHTML = '';
        return;
    }

    if (letraActual != 10) return; 
    const letras = filas[filaActual].querySelectorAll('.letra');
    let fechaIngresada = Array.from(letras).map(letter => letter.textContent).join('');

    if (!listaFechas.includes(fechaIngresada)) {
        mensajeFinal = `Esta fecha no está incluida en el diccionario, acuérdate se escribe, XX-XX-XXXX y va de 0 a 9`;
        finalDiv.innerHTML = mensajeFinal;
        return;
    }

    let diaCorrecto = fechaCorrecta.slice(0, 2);
    let mesCorrecto = fechaCorrecta.slice(3, 5);
    let añoCorrecto = fechaCorrecta.slice(6, 10);

    let diaIngresado = fechaIngresada.slice(0, 2);
    let mesIngresado = fechaIngresada.slice(3, 5);
    let añoIngresado = fechaIngresada.slice(6, 10);

    let sum = 0;

    const compararYAsignarColor = (valorIngresado, valorCorrecto, index, esParteCorrecta) => {
        const letter = letras[index];
        letter.classList.add('checked');
        const tecla = document.querySelector(`.key[data-key="${letter.textContent.toLowerCase()}"]`);

        if (valorIngresado === valorCorrecto) {
            letter.style.backgroundColor = 'green';
            if (tecla) tecla.style.backgroundColor = 'green';
            sum++;
        } else if (esParteCorrecta) {
            letter.style.backgroundColor = 'yellow';
            if (tecla && tecla.style.backgroundColor !== 'green') {
                tecla.style.backgroundColor = 'yellow';
            }
        } else {
            letter.style.backgroundColor = 'gray';
            if (tecla) tecla.style.backgroundColor = 'gray';
        }
    };

    compararYAsignarColor(diaIngresado[0], diaCorrecto[0], 0, diaCorrecto.includes(diaIngresado[0]));
    compararYAsignarColor(diaIngresado[1], diaCorrecto[1], 1, diaCorrecto.includes(diaIngresado[1]));
    compararYAsignarColor(mesIngresado[0], mesCorrecto[0], 3, mesCorrecto.includes(mesIngresado[0]));
    compararYAsignarColor(mesIngresado[1], mesCorrecto[1], 4, mesCorrecto.includes(mesIngresado[1]));
    for (let i = 6; i < 10; i++) {
        compararYAsignarColor(añoIngresado[i - 6], añoCorrecto[i - 6], i, añoCorrecto.includes(añoIngresado[i - 6]));
    }

    if (fechaIngresada === '11-09-2001') { // atentado torres gemelas
        const imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="descarga(torres-gemelas).png" alt="Imagen" />';
    }
    if (fechaIngresada === '04-08-0070') { // destrucción del Beit Hamikdash
       const imagen = document.getElementById('imagen-easter-egg');
       imagen.innerHTML = '<img src="descarga(beit-hamikdash-caida).png" alt="Imagen" />'
    }
    if (fechaIngresada === '06-08-1945') { // hiroshima
        const imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="imagen(hiroshima).png" alt="Imagen" />'
    }
    if (fechaIngresada === '09-08-1945') { // little boy
        const imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="descarga(nagasaki).png" alt="Imagen" />'
    }
    if (fechaIngresada === '23-08-2008') { // cumple de gandel
        const imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="99615.png" alt="Imagen" />'
    }
    if (fechaIngresada === '23-06-2009') { // cumple de manu
        const imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="90821.png" alt="Imagen" />'
    }
    if (fechaIngresada === '22-12-2008') { // cumple de tobi
        const imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="91075.png" alt="Imagen" />'
    }
    if (fechaIngresada === '09-01-2009') { // cumple de oneto
        const imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="96400.png" alt="Imagen" />'
    }
    if (fechaIngresada === '16-04-2009') { // cumple de pipa
        const imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="106798.png" alt="Imagen" />'
    }
    if (fechaIngresada === '07-02-2023') { // creacion de skibidi toilet
        const imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="descarga (skibidi-toilet).png" alt="Imagen" />'
    }
    if (fechaIngresada === '26-09-2008') { // cumple sakito
        const imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="96912.png" alt="Imagen" />'
    }        
    if (fechaIngresada === '01-12-2019') { // creacion de aieka
        const imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="descarga(aieka).png" alt="Imagen" />'
    }      
    if (fechaIngresada === '26-04-1986') { // chernobyl
        const imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="descarga(chernobyl).png" alt="Imagen" />'
    }
    if (fechaIngresada === '03-08-2008') { // cumple fogo
        const imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="96879.png" alt="Imagen" />'
    }  
    if (fechaIngresada === '01-09-1939') { // invasion de polonia
        const imagen = document.getElementById('imagen-easter-egg');
        imagen.innerHTML = '<img src="descarga(invasion-polonia).png" alt="Imagen" />'
    }   
    if (filaActual == 6) {          
        mensajeFinal = `Has alcanzado el número máximo de intentos. La fecha correcta era: ${fechaCorrecta}`;
        finalDiv.innerHTML = mensajeFinal;
        juegoTerminado = true;
    } else if (diaIngresado == diaCorrecto && mesIngresado == mesCorrecto && añoIngresado == añoCorrecto) {
        mensajeFinal = `¡Felicidades! Has descubierto la fecha correcta: ${fechaCorrecta}.`;
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
        confirmarFecha();
    } else if (e.key === 'Backspace' && letraActual > 0) {
        letraActual--;
        letras[letraActual].textContent = '';
    } else if (e.key.match(/^[0-9\-]$/) && letraActual < 10) {  
        letras[letraActual].textContent = e.key;
        letraActual++;
    }
});

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
