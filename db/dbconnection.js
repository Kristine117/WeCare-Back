// Get the client
const mysql = require("mysql2");
// Create the connection to database

const connection = mysql.createConnection(
  `mysql://${process.env.USER}:${process.env.PASSWORD}@localhost:3306/${process.env.DB}`
);

module.exports = {
  connection
}

