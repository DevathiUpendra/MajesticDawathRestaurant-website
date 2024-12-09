// server/models/user.js
const db = require('../config/db');

const User = {
  create: async (username, password, role) => {
    const [result] = await db.execute(
      'INSERT INTO Users (username, password, role) VALUES (?, ?, ?)',
      [username, password, role]
    );
    return result.insertId;
  },

  findByUsername: async (username) => {
    const [rows] = await db.execute(
      'SELECT * FROM Users WHERE username = ?',
      [username]
    );
    return rows[0];
  }
};

module.exports = User;
