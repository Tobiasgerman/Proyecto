const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Genero = sequelize.define('Genero', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    nombre: DataTypes.STRING,
});

module.exports = Genero;
