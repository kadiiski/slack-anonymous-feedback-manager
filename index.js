const dotenv = require("dotenv");
// Keep this line at the top of the file to load environment variables.
dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

const bodyParser = require("body-parser");
const express = require("express");
const {handleAppHomeTab} = require("./src/app/appHomeTab");
const {handleSlashCommand} = require("./src/main");
const {handleStartFeedbackDiscussion, handleMiddleManDiscussionEvent} = require("./src/app/feedbackDiscussin");
const {pageNotFoundHtml, pageHomeHtml} = require("./src/app/staticPagesHtml");
const {handleFeedbackSubmission, handleGiveFeedbackCommand} = require("./src/app/giveFeedbackCommand");

const app = express();
const PORT = process.env.PORT || 3000;

const initDB = require("./src/orm/initDB");

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

    // Acknowledge the command.
    res.status(200).send("");
  } catch (error) {
    console.error("Error handling Slack command:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/slack/interactivity', async (req, res) => {
  const payload = JSON.parse(req.body.payload); // Parse payload from Slack
  const action = payload?.actions?.[0]?.action_id;

  if (action === "submit_feedback") {
    handleGiveFeedbackCommand(payload).then();
  }

  if (action?.startsWith("discuss_feedback_")) {
    handleStartFeedbackDiscussion(payload).then()
  }

  if (payload.type === 'view_submission' && payload.view.callback_id === 'give_feedback_modal') {
    const responseData = await handleFeedbackSubmission(payload);
    // Respond to acknowledge the event.
    res.status(200).send(responseData);
  } else {
    res.status(400).send('Unknown interaction');
  }
});

// Route for handling Slack events
app.post("/slack/events", async (req, res) => {
  try {
    const payload = req.body;
    const event = payload.event;
    let response = "";

    if (payload.type === "url_verification") {
      // Respond to Slack's verification challenge
      response = payload.challenge;
    }

    // Display the app home tab when the app is opened.
    if (event.type === "app_home_opened") {
      handleAppHomeTab(event).then();
    }

    // Handle view submission events for the feedback modal.
    if (event?.type === 'view_submission' && event?.view?.callback_id === 'give_feedback_modal') {
      // Must return response.
      response = await handleFeedbackSubmission(event);
    }

    // If it's a message event and not from a bot, handle the discussion.
    if (event?.type === 'message' && !event.bot_id && event.thread_ts) {
      handleMiddleManDiscussionEvent(event).then();
    }

    // Acknowledge the event.
    res.status(200).send(response);
  } catch (error) {
    console.error("Error handling Slack event:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Default homepage route
app.get("/", (req, res) => {
  res.send(pageHomeHtml);
});

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).send(pageNotFoundHtml);
});

// Initialize the database before starting the app
(async () => {
  await initDB();
  // Start the Express server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
