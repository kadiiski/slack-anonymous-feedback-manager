const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize"); // Sequelize instance

const Feedback = sequelize.define("Feedback", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  date: { type: DataTypes.DATE, allowNull: false },
  author_slack_id: { type: DataTypes.STRING, allowNull: false },
  recipient_slack_id: { type: DataTypes.STRING, allowNull: false },
  feedback: { type: DataTypes.TEXT, allowNull: false },
});

const Thread = sequelize.define("Thread", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  feedback_id: { type: DataTypes.INTEGER, allowNull: false },
  manager_thread_ts: { type: DataTypes.STRING, allowNull: false },
  author_thread_ts: { type: DataTypes.STRING, allowNull: false },
  manager_slack_id: { type: DataTypes.STRING, allowNull: false },
  author_slack_id: { type: DataTypes.STRING, allowNull: false },
});

// Relationships
Thread.belongsTo(Feedback, { foreignKey: "feedback_id" });

module.exports = { Feedback, Thread };
