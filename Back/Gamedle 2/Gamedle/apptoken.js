const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

require('dotenv').config();

async function obtenerToken() {
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: process.env.IGDB_CLIENT_ID,
                client_secret: process.env.IGBD_CLIENT_SECRET,
                grant_type: 'client_credentials'
            },
            httpsAgent: httpsAgent
        });
        console.log('Access Token:', response.data.access_token);
    } catch (error) {
        console.error('Error al obtener el token:', error.response ? error.response.data : error.message);
    }
}

obtenerToken();
