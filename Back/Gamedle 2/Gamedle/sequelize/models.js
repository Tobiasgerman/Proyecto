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
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
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
}, {
  timestamps: false,
});

const basquet = sequelize.define('basquet', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pais: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  equipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  camiseta: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
  freezeTableName: true,
});

const formula1 = sequelize.define('formula1', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nacionalidad: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaNacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: false,
  freezeTableName: true,
});

const tennis = sequelize.define('tennis', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ranking: {
    type: DataTypes.INTEGER,
  },
  nacionalidad: {
    type: DataTypes.STRING,
  },
  cumpleaños: {
    type: DataTypes.DATE,
  },
  manoDominante: {
    type: DataTypes.STRING,
  },
  altura: {
    type: DataTypes.INTEGER,
  },
  peso: {
    type: DataTypes.INTEGER,
  },
}, {
  timestamps: false,
  freezeTableName: true,
});

const Paises = sequelize.define('Paises', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitud: {
    type: DataTypes.FLOAT, 
    allowNull: false,
    },
    longitud: {
        type: DataTypes.FLOAT, 
        allowNull: false,
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},
{
  timestamps: false, 
  });


module.exports = { User, Game, basquet, formula1, tennis, Paises };
