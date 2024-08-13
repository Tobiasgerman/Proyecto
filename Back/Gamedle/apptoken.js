const axios = require('axios');

async function obtenerToken() {
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: 'txl67kdypncb7y5da96408724ga35o',
                client_secret: 'rfzt85raolb8iwc39xcdj3vzu1fi3r',
                grant_type: 'client_credentials'
            }
        });
        console.log('Access Token:', response.data.access_token);
    } catch (error) {
        console.error('Error al obtener el token:', error.response ? error.response.data : error.message);
    }
}

obtenerToken();
