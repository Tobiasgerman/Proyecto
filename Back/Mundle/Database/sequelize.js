const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('Mundle', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;