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

window.onload = jugar;