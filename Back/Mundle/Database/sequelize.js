const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('mundle', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;