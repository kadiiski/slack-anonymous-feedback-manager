const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { handleSlashCommand, handleFeedbackDiscussion, handleSlackEvent } = require("./utils/feedbackBot");

dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

const app = express();
const PORT = process.env.PORT || 3000;

const initDB = require("./utils/orm/initDB");

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

// Default homepage route
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Server Running</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
        }
        h1 {
          color: #4CAF50;
        }
        p {
          color: #555;
        }
      </style>
    </head>
    <body>
      <h1>🚀 Server is Running!</h1>
      <p>Your application is up and running.</p>
      <p>Use the API endpoints as intended.</p>
    </body>
    </html>
  `);
});

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 Not Found</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
        }
        h1 {
          color: #FF5722;
        }
        p {
          color: #555;
        }
        a {
          color: #FF5722;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <h1>😕 404 - Page Not Found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <p><a href="/">Go back to the homepage</a></p>
    </body>
    </html>
  `);
});


// Initialize the database before starting the app
(async () => {
  await initDB();
  // Start the Express server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
