const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Usuarios = sequelize.define('usuarios', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  timeTaken: {
    type: DataTypes.INTEGER, 
    allowNull: false,
  },
},
  {
    timestamps: false, 
});


module.exports = { Usuarios, Paises };