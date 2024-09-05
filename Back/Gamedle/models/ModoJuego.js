const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');


const ModoJuego = sequelize.define('ModoJuego', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    nombre: DataTypes.STRING,
});

module.exports = ModoJuego;
