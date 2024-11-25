const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { handleSlashCommand, handleFeedbackDiscussion, handleSlackEvent } = require("./utils/feedbackBot");

dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for parsing application/json
app.use(bodyParser.json());

// Route for handling Slack commands
app.post("/slack/commands", async (req, res) => {
  try {
    const slackCommand = req.body;

    // Process the command asynchronously
    handleSlashCommand(slackCommand).then();

    // Acknowledge the command
    res.status(200).send("");
  } catch (error) {
    console.error("Error handling Slack command:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route for handling Slack actions
app.post("/slack/actions", async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload); // Decode and parse the payload
    const action = payload.actions[0]; // Assuming one action per payload

    if (action.action_id.startsWith("discuss_feedback_")) {
      handleFeedbackDiscussion(payload, action).then()
    }

    // Acknowledge the action
    res.status(200).send("");
  } catch (error) {
    console.error("Error handling Slack action:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route for handling Slack events
app.post("/slack/events", async (req, res) => {
  try {
    const payload = req.body;

    if (payload.type === "url_verification") {
      // Respond to Slack's verification challenge
      res.status(200).send(payload.challenge);
      return;
    }

    if (payload.type === "event_callback") {
      handleSlackEvent(payload.event).then();
    }

    // Acknowledge the event
    res.status(200).send("");
  } catch (error) {
    console.error("Error handling Slack event:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
