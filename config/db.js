const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

pool.getConnection((err) => {
    if (err) throw err;
    console.log("Connected to MySQL Database");
});

module.exports = pool.promise();
