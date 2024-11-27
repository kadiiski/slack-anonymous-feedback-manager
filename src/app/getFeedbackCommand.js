const {respondToSlashCommand, sendMessageBlocks, getSlackUserById} = require("../utils/slack-utils");
const {getFeedbackByRecipientId} = require("../utils/orm-utils");

async function handleGetFeedbackCommand({ text, user_id, response_url }) {
  // Check if the message matches the expected format.
  const match = text.match(/^(\S+)\s+((?:<@[\w]+(?:\|[^>]*)?>[,\s]*|and\s*)+)/i); // Match "<password> <@USER_ID>"
  // or "<password> <@USER_ID|display_name>"
  if (!match) {
    respondToSlashCommand(response_url, `Invalid format. Please include \`<password>\` followed by mentions like \`@person\`.`).then();
    return;
  }

  const password = match[1]; // Extract the password
  const recipientsText = match[2]; // Extract all mentions

  // Validate the password
  if (password.trim().toLowerCase() !== process.env.MANAGER_PASSWORD.trim().toLowerCase()) {
    respondToSlashCommand(response_url, "Invalid password. Access denied.").then();
    return;
  }

  if (recipientsText.includes(user_id)) {
    respondToSlashCommand(response_url, "You can't get feedback for yourself, i'll just ignore it.").then();
  }

  // Extract all user IDs, matching both formats <@USER_ID> and <@USER_ID|display_name>
  const recipientIds = [...recipientsText.matchAll(/<@([\w]+)(?:\|[^>]*)?>/g)]
    // Get the proper match for the IDs.
    .map(m => m[1])
    // Remove duplicates.
    .filter((value, index, array) => array.indexOf(value) === index)
    .filter(id => id !== user_id)
  ;

  if (recipientIds.length === 0) {
    respondToSlashCommand(response_url, "Please mention at least one recipient using @ (e.g., `@person`).").then();
    return;
  }

  const blocks = [];

  for (const recipientId of recipientIds) {
    const feedbackForRecipient = await getFeedbackByRecipientId(recipientId);
    const recipientUser = await getSlackUserById(recipientId);

    if (feedbackForRecipient.length === 0) {
      blocks.push({
        type: 'header',
        text: {
          type: 'plain_text',
          text: `No feedback found for ${recipientUser.profile.real_name}:`,
        },
      });
    } else {
      blocks.push({
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Feedback for ${recipientUser.profile.real_name}:`,
        },
      });

      for (const record of feedbackForRecipient) {
        // Convert the string to a Date object
        const date = new Date(record.date);

        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${date.toDateString()}*`
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Discuss"
            },
            action_id: `discuss_feedback_${record.id}`
          }
        });

        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `> _${record.feedback}_`
          }
        });
      }
    }

    blocks.push({
      type: "divider"
    });
  }

  await sendMessageBlocks(blocks, "Here is the feedback:", user_id);
}

module.exports = {handleGetFeedbackCommand};
