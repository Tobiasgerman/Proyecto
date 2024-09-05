const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');


const MotorJuego = sequelize.define('MotorJuego', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    nombre: DataTypes.STRING,
});

module.exports = MotorJuego;
