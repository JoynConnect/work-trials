const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres', 'root', 'test1234', {
  host: 'localhost',
  dialect: 'postgres',
});

module.exports = sequelize;