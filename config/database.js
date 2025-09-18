const { Sequelize } = require('sequelize');
const path = require('path');

// Using SQLite for simplicity (good for students)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false, // Set to console.log to see SQL queries
});

module.exports = { sequelize };