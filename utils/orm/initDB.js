const sequelize = require("./sequelize");
const { Feedback, Thread } = require("./models");

const initDB = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Log the database dialect and connection details
    console.log(`ℹ️  Database dialect: ${sequelize.getDialect()}`);
    if (sequelize.options.dialect === "sqlite") {
      console.log(`ℹ️  SQLite database file: ${sequelize.options.storage}`);
    } else {
      console.log(`ℹ️  Connected to: ${sequelize.options.host || "Unknown Host"}`);
    }

    // Synchronize models
    console.log("⏳ Synchronizing models...");
    await sequelize.sync({ alter: true }); // Creates or updates tables based on models
    console.log("✅ Models synchronized successfully.");
  } catch (error) {
    // Print error details and exit
    console.error("❌ Unable to connect to the database or synchronize models:", error.message);
    console.error("Details:", error);
    process.exit(1); // Exit if the database connection fails
  }
};

module.exports = initDB;
