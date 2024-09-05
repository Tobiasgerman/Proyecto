const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Tema = sequelize.define('Tema', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    nombre: DataTypes.STRING,
});

module.exports = Tema;
