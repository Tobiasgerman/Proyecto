const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const User = sequelize.define('usuarios', {
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
    type: DataTypes.INTEGER, // Time in seconds
    allowNull: false,
  },
},
  {
    timestamps: false, // Esto añade automáticamente `createdAt` y `updatedAt`
});

const Game = sequelize.define('juegos', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaLanzamiento: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  modoConocido: {   
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
},
{
  timestamps: false, // Esto añade automáticamente `createdAt` y `updatedAt`
  });


module.exports = { User, Game };