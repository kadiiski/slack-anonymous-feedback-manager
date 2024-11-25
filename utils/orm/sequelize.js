const { Sequelize } = require("sequelize");
const pg = require("pg");

// Use environment variables to configure the database
const DB_TYPE = process.env.DB_TYPE || "sqlite"; // 'sqlite' or 'postgres'
const DATABASE_URL = process.env.DATABASE_URL || "./feedback.db";

let sequelize;

if (DB_TYPE === "postgres") {
  // PostgresSQL configuration
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    dialectModule: pg, // Use the 'pg' module for PostgresSQL (fixes error in Vercel)
    logging: false, // Disable logging or set to `console.log` for debugging
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Allow self-signed certificates for hosted databases
      },
    },
  });
} else {
  // SQLite configuration
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: DATABASE_URL, // SQLite file path
    logging: false, // Disable logging or set to `console.log` for debugging
  });
}

module.exports = sequelize;
