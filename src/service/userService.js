const { users } = require('../model/userModel');
const bcrypt = require('bcryptjs');

function findUserByUsername(username) {
  return users.find(u => u.username === username);
}

function registerUser({ username, password }) {
  if (findUserByUsername(username)) {
    throw new Error('User already exists');
  }
  const hashedPassword = bcrypt.hashSync(password, 8);
  const user = { username, password: hashedPassword };
  users.push(user);
  return { username };
}

function loginUser({ username, password }) {
  const user = findUserByUsername(username);
  if (!user) throw new Error('User not found');
  if (!bcrypt.compareSync(password, user.password)) throw new Error('Invalid password');
  return { username: user.username };
}

function listUsers() {
  return users.map(u => ({ username: u.username }));
}

module.exports = { registerUser, loginUser, listUsers, findUserByUsername };
