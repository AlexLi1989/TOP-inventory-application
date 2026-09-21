const { Pool } = require("pg");

let poolConfig = {};

if (process.env.DB_URL) {
  poolConfig = { connectionString: process.env.DB_URL };
} else {
  poolConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
  };
}

module.exports = new Pool(poolConfig);
