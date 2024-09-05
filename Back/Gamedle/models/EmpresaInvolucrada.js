const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const EmpresaInvolucrada = sequelize.define('EmpresaInvolucrada', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    nombre: DataTypes.STRING,
});

module.exports = EmpresaInvolucrada;
