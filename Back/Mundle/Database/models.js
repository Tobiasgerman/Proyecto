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

const Paises = sequelize.define('Paises', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitud: {
    type: DataTypes.FLOAT, // Usar FLOAT para la latitud
    allowNull: false,
    },
    longitud: {
        type: DataTypes.FLOAT, // Usar FLOAT para la longitud
        allowNull: false,
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},
{
  timestamps: false, // Esto añade automáticamente `createdAt` y `updatedAt`
  });


module.exports = { Usuarios, Paises };