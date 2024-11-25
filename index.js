const dotenv = require("dotenv");
const http = require('http');
const { handleSlashCommand, handleFeedbackDiscussion, handleSlackEvent } = require("./utils/feedbackBot");

dotenv.config();
dotenv.config({ path: `.env.local`, override: true });
const parseRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
};

const handleCommands = async (body) => {
  const params = new URLSearchParams(body);
  const slackCommand = Object.fromEntries(params.entries());

  // Process the command asynchronously
  handleSlashCommand(slackCommand).catch(console.error);

  // Return the response to acknowledge the command
  return { status: 200, contentType: 'text/plain', body: '' };
};

const handleActions = async (body) => {
  const params = new URLSearchParams(body);
  const payload = JSON.parse(params.get('payload')); // Decode and parse the payload
  const action = payload.actions[0]; // Assuming one action per payload

  if (action.action_id.startsWith('discuss_feedback_')) {
    handleFeedbackDiscussion(payload, action).catch(console.error);
  }

  // Return the response to acknowledge the action
  return { status: 200, contentType: 'text/plain', body: '' };
};

const handleEvents = async (body) => {
  const payload = JSON.parse(body);

  if (payload.type === 'url_verification') {
    // Respond immediately for verification requests
    return { status: 200, contentType: 'text/plain', body: payload.challenge };
  }

  if (payload.type === 'event_callback') {
    handleSlackEvent(payload.event).catch(console.error);
  }

  // Return the response to acknowledge the event
  return { status: 200, contentType: 'text/plain', body: '' };
};

const routeHandlers = {
  '/slack/commands': handleCommands,
  '/slack/actions': handleActions,
  '/slack/events': handleEvents,
};

const routeRequest = async (req, res) => {
  const handler = routeHandlers[req.url];
  if (!handler || req.method !== 'POST') {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  try {
    const body = await parseRequestBody(req);

    // Await the handler's response
    const response = await handler(body);

    // Send the response returned by the handler
    res.writeHead(response.status, { 'Content-Type': response.contentType });
    res.end(response.body);
  } catch (error) {
    console.error('Error processing request:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
};

const server = http.createServer(routeRequest);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server started on port', PORT);
});
