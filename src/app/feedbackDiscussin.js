const {
  getFeedbackById,
  getThreadStateByFeedbackId,
  insertThreadState,
  getThreadStateByThreadTs
} = require("../utils/orm-utils");
const {sendMessage, replyToThread, getSlackUserById, slackClient} = require("../utils/slack-utils");

async function handleStartFeedbackDiscussion(payload) {
  const { user, actions } = payload;
  if (!actions?.[0]) {
    console.error('No action found in the payload.');
    return;
  }

  const managerSlackId = user.id; // The manager initiating the discussion
  const feedbackId = actions[0].action_id.split('discuss_feedback_')[1]; // Extract the feedback ID

  // Retrieve the feedback details from the database
  const feedbackRecord = await getFeedbackById(feedbackId);

  if (!feedbackRecord) {
    console.error('Feedback not found for ID:', feedbackId);
    sendMessage(`Sorry, but I can't find the feedback for ID: ${feedbackId}, couldn't initiate a discussion.`, managerSlackId).then();
    return;
  }

  const { author_slack_id, feedback, recipient_slack_id } = feedbackRecord;

  if (author_slack_id === managerSlackId) {
    sendMessage(`Sorry, but you can't discuss your own feedback.`, managerSlackId).then();
    return;
  }

  // Check if the thread already exist for this same feedback, author and manager.
  const threadStates = await getThreadStateByFeedbackId(feedbackId, author_slack_id, managerSlackId);
  if (threadStates.length > 0) {
    const threadState = threadStates[0];
    const existingDiscussionBlocks = [
      {
        type: 'context',
        elements: [{
          type: 'mrkdwn',
          text: '_Further discussion requested._'
        }]
      }
    ];
    const {author_slack_id, manager_slack_id, author_thread_ts, manager_thread_ts} = threadState

    await replyToThread({
      message: `Further discussion requested.`,
      blocks: existingDiscussionBlocks,
      channel: author_slack_id,
      thread_ts: author_thread_ts
    });
    await replyToThread({
      message: `Further discussion requested.`,
      blocks: existingDiscussionBlocks,
      channel: manager_slack_id,
      thread_ts: manager_thread_ts
    });
    return;
  }

  const sharedBlocks = [
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: 'You can reply to this message to communicate anonymously. Elmo will be your middle man.'
        }
      ]
    }
  ]

  const recipientSlackUser = await getSlackUserById(recipient_slack_id);

  const managerBlocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:shushing_face: *Anonymous discussion about <@${recipient_slack_id}> feedback:*\n _${feedback}_`
      },
      accessory: {
        type: "image",
        image_url: recipientSlackUser ? recipientSlackUser.profile.image_original : null,
        alt_text: recipientSlackUser ? recipientSlackUser.profile.real_name : "User Image"
      }
    },
    ...sharedBlocks
  ];

  const authorBlocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:shushing_face: *Your manager requested anonymous discussion about feedback you submitted for <@${recipient_slack_id}>:*\n _${feedback}_`
      },
      accessory: {
        type: "image",
        image_url: recipientSlackUser ? recipientSlackUser.profile.image_original : null,
        alt_text: recipientSlackUser ? recipientSlackUser.profile.real_name : "User Image"
      }
    },
    ...sharedBlocks
  ];

  // Start the discussion thread
  const managerThread = await slackClient.chat.postMessage({
    channel: managerSlackId,
    text: `Anonymous discussion about <@${recipient_slack_id}> feedback:\n\n"${feedback}"`,
    blocks: managerBlocks,
  });

  // Send an initial message to the author
  const authorThread = await slackClient.chat.postMessage({
    channel: author_slack_id,
    text: `Your manager requested anonymous discussion about feedback you submitted for:\n\n"${feedback}"`,
    blocks: authorBlocks,
  });

  await insertThreadState(feedbackId, managerThread.ts, authorThread.ts, managerSlackId, author_slack_id);
}

// Returns response to the Slack event.
async function handleMiddleManDiscussionEvent(event) {
  if (!event.thread_ts) {
    console.log('No thread_ts found in the event.');
    return;
  }

  // Check if the message is a reply to already existing thread.
  const threadState = await getThreadStateByThreadTs(event.thread_ts);
  if (!threadState) {
    console.log('No active thread found for this message.');
    return;
  }

  const { manager_slack_id, author_slack_id, author_thread_ts, manager_thread_ts } = threadState;

  if (event.user === manager_slack_id && event.thread_ts === manager_thread_ts) {
    // Manager sent a message, forward it to the author's thread
    replyToThread({
      message: event.text,
      channel: author_slack_id,
      thread_ts: author_thread_ts
    }).then();
  } else if (event.user === author_slack_id && event.thread_ts === author_thread_ts) {
    // Author sent a message, forward it to the manager's thread
    replyToThread({
      message: event.text,
      channel: manager_slack_id,
      thread_ts: manager_thread_ts
    }).then();
  } else {
    console.log('Message from an unexpected user or thread received.', event);
    sendMessage(`Unexpected message received or I couldn't find the thread. Contact the app admin. Here are some details: \`\`\`${JSON.stringify(event)}\`\`\``, manager_slack_id).then();
  }
}

module.exports = {handleStartFeedbackDiscussion, handleMiddleManDiscussionEvent};
