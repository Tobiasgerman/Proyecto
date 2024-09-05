const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Plataforma = sequelize.define('Plataforma', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    nombre: DataTypes.STRING,
});

module.exports = Plataforma;
