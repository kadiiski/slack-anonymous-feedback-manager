const { respondToSlashCommand, deleteBotHistoryWithUser } = require("./utils/slack-utils");
const {handleHelpCommand} = require("./app/helpCommand");
const {handleGetFeedbackCommand} = require("./app/getFeedbackCommand");
const {handleGiveFeedbackCommand} = require("./app/giveFeedbackCommand");

// Handle Slash Commands
async function handleSlashCommand(commandBody) {
  const { command, user_id, response_url } = commandBody;

  // Route commands
  if (command === "/give-feedback") {
    await handleGiveFeedbackCommand(commandBody);
  } else if (command === "/get-feedback") {
    await handleGetFeedbackCommand(commandBody);
  } else if (command === "/delete-history") {
    // Delete all messages from the bot
    await respondToSlashCommand(response_url, "Fine, I will delete all my messages. ;)");
    await deleteBotHistoryWithUser(user_id);
  } else if (command === "/elmo-help") {
    await handleHelpCommand(commandBody);
  } else {
    await respondToSlashCommand(response_url, `Unrecognized command. Use \`/help\`, \`/give-feedback\` or \`/get-feedback\`.`);
  }
}

module.exports = {handleSlashCommand};
