const {getSlackUserById, slackClient, respondToSlashCommand, sendMessage, sendMessageEphemeral} = require("../utils/slack-utils");
const {insertFeedback} = require("../utils/orm-utils");
const {encrypt} = require("../utils/encrypt-utils");

async function handleGiveFeedbackCommand({ trigger_id, text = "", response_url, user = null }) {
  // Extract recipient ID if provided in the slash command.
  // Parse message for recipient and feedback.
  // Match <@USER_ID>, <@USER_ID|>, <@USER_ID|name> with feedback
  const match = text.match(/^<@([A-Z0-9]+)(?:\|[^>]*)?>\s*(.*)/);

  const recipientId = match?.[1]; // Extracts the recipient's Slack ID (e.g., U12345678)
  const feedback = match?.[2];    // Extracts the feedback text

  const recipient = recipientId ? await getSlackUserById(recipientId) : null;

  slackClient.views.open({
    trigger_id: trigger_id, // Use the trigger_id from the slash command payload.
    view: {
      type: 'modal',
      callback_id: 'give_feedback_modal',
      title: {
        type: 'plain_text',
        text: 'Give Feedback',
      },
      submit: {
        type: 'plain_text',
        text: 'Submit',
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
      },
      blocks: [
        {
          type: 'input',
          block_id: 'recipient_block',
          label: {
            type: 'plain_text',
            text: 'Recipient',
          },
          element: {
            type: 'users_select',
            action_id: 'recipient_input',
            placeholder: {
              type: 'plain_text',
              text: 'Select a user',
            },
            initial_user: recipient ? recipient.id : undefined, // Preselect the tagged user if available
          },
        },
        {
          type: 'input',
          block_id: 'feedback_block',
          label: {
            type: 'plain_text',
            text: 'Feedback',
          },
          element: {
            type: 'plain_text_input',
            action_id: 'feedback_input',
            multiline: true,
            initial_value: feedback || '',
          },
        },
      ],
    },
  }).catch((error) => {
    console.error('Error opening modal:', error);
    // If triggered from a slash command, respond to the command.
    const errMsg = `Something went wrong while trying to open the feedback form. Please try again later. \n\`\`\`${JSON.stringify(error)}\`\`\``;
    if (response_url) {
      respondToSlashCommand(response_url, ).then();
    } else if (user) {
      sendMessageEphemeral(user.id, user.id, ).then();
    }
  });
}

// Handle feedback submission from the modal in a non-blocking way.
async function handleFeedbackSubmission(payload) {
  const {user, view} = payload;
  const authorId = user.id;

  // Extract data from the modal
  const recipientId = view.state.values.recipient_block.recipient_input.selected_user;
  const feedbackText = view.state.values.feedback_block.feedback_input.value;

  if(!recipientId) {
    console.error('Invalid recipient format:', recipientId);
    return {response_action: 'errors', errors: {recipient_block: 'Please mention a valid Slack user.'}};
  }

  // Encrypt and save the feedback
  try {
    const encryptedFeedback = encrypt(feedbackText);
    await insertFeedback(authorId, recipientId, encryptedFeedback).then();
    return {response_action: 'clear'}; // Close the modal and confirm success
  } catch (error) {
    console.error('Error saving feedback:', error);
    return {response_action: 'errors', errors: {feedback_block: 'Something went wrong. Please try again later.'}};
  }
}

module.exports = { handleFeedbackSubmission, handleGiveFeedbackCommand };
