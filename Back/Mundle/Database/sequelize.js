const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('Multiwordle', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;