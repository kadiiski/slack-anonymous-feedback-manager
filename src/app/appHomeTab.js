const {slackClient} = require("../utils/slack-utils");

const handleAppHomeTab = async ({user}) => {
  // Publish a Home Tab view for the user
  await slackClient.views.publish({
    user_id: user,
    view: {
      type: 'home',
      callback_id: 'home_tab',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '👋 *Hello! I’m here to help you manage feedback.*\n\nHere’s what I can do:',
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Submit Feedback',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '• Share feedback about someone confidentially.\n• *Format*: `/give-feedback @recipient your feedback`\n• *Example*: `/give-feedback @john_doe Great job on the project!`',
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Submit Feedback',
            },
            action_id: 'submit_feedback',
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '💡 *Tip*: You can do this anywhere. If unsure, try it in your DMs.',
            },
          ],
        },
        {
          type: 'divider',
        },
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Retrieve Feedback (Managers Only)',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '• View feedback submitted for one or more people.\n• *Format*: `/get-feedback <password> @recipient1, @recipient2...`\n• *Example*: `/get-feedback secret123 @john_doe, @jane_smith`',
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '💡 *Tip*: You can do this anywhere. If unsure, try it in your DMs.',
            },
          ],
        },
        {
          type: 'divider',
        },
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Help',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '• Get this Elmo help message anytime.\n• *Command*: `/help`',
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':tea_kermit: *Managers* can initiate confidential discussions about specific feedback items. Elmo' +
              ' acts as a middleman to convey messages anonymously.',
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '💡 *Note*: All messages are confidential. Feedback is encrypted and deleted after processing.',
            },
          ],
        },
      ],
    },
  }).catch((error) => {
    // Sometimes even tho the home tab is disabled for the app, slack still emits the event.
    console.error('Error publishing Home Tab view:', error);
  });
}

module.exports = { handleAppHomeTab };
