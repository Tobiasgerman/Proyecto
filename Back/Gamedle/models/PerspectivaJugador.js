const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');



const PerspectivaJugador = sequelize.define('PerspectivaJugador', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    nombre: DataTypes.STRING,
});

module.exports = PerspectivaJugador;
