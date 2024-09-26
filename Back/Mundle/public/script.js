async function obtenerPaises() { 
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
    const guessRows = document.querySelectorAll('.guess-row');
    let intento = 0; // Contador de intentos

    document.getElementById('submit').addEventListener('click', async () => {
        if (intento >= guessRows.length) {
            alert(`Has Perdido, el país era ${paisAleatorio.nombre}`);
  
            return;
        }

        const paisElegido = document.getElementById('pais').value;
        const mensajeDiv = document.createElement('div');
        let mensaje;

        if (paisElegido.toLowerCase() === paisAleatorio.nombre.toLowerCase()) {
            mensaje = `¡Ganaste! El país era ${paisAleatorio.nombre.common}`;
        } else {
            const resultado = await enviarRespuesta(paisElegido, paisAleatorio);
            mensaje = `El país aleatorio está a ${resultado.distancia} km y se encuentra en dirección ${resultado.direccion}`;
        }

        mensajeDiv.textContent = mensaje; 
        guessRows[intento].appendChild(mensajeDiv); 
        intento++; 

        // Limpiar el input
        document.getElementById('pais').value = '';
    });
}

window.onload = jugar;
