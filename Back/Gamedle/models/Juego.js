const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Juego = sequelize.define('Juego', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    nombre: DataTypes.STRING,
    fechaLanzamiento: DataTypes.DATE,
    modoConocido: DataTypes.BOOLEAN, // Almacenar si es del modo conocido
});

module.exports = Juego;
