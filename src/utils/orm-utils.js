const {decrypt} = require('./encrypt-utils');
const { Feedback, Thread } = require("../orm/models");
const {Op} = require("sequelize");

const insertFeedback = async (authorSlackId, recipientSlackId, encryptedFeedback) => {
  return await Feedback.create({
    date: new Date(),
    author_slack_id: authorSlackId,
    recipient_slack_id: recipientSlackId,
    feedback: encryptedFeedback,
  });
};

const insertThreadState = async (feedbackId, managerThreadTs, authorThreadTs, managerSlackId, authorSlackId) => {
  return await Thread.create({
    feedback_id: feedbackId,
    manager_thread_ts: managerThreadTs,
    author_thread_ts: authorThreadTs,
    manager_slack_id: managerSlackId,
    author_slack_id: authorSlackId,
  });
};

const getAllFeedback = async () => {
  const feedbacks = await Feedback.findAll(); // Fetch all feedback from the database
  return feedbacks.map(fb => {
    const data = fb.toJSON(); // Convert Sequelize instance to plain object
    return {
      ...data,
      feedback: decrypt(data.feedback), // Decrypt the feedback field
    };
  });
};

const getFeedbackByRecipientId = async (slackId) => {
  const feedbacks = await Feedback.findAll({
    where: { recipient_slack_id: slackId },
  }); // Fetch all feedback for the recipient

  return feedbacks.map(fb => {
    const data = fb.toJSON(); // Convert Sequelize instance to plain object
    return {
      ...data,
      feedback: decrypt(data.feedback), // Decrypt the feedback field
    };
  });
};

const getFeedbackById = async (id) => {
  const feedback = (await Feedback.findByPk(id)).toJSON();
  return {
    ...feedback,
    feedback: decrypt(feedback.feedback), // Decrypt the feedback field
  };
};

const getThreadStateByThreadTs = async (thread_ts) => {
  const thread = await Thread.findOne({
    where: {
      [Op.or]: [
        { manager_thread_ts: thread_ts },
        { author_thread_ts: thread_ts },
      ],
    },
  });

  return thread ? thread.toJSON() : null; // Convert Sequelize instance to plain object if found
};

const getThreadStateByFeedbackId = async (feedbackId, authorSlackId, managerSlackId) => {
  const threads = await Thread.findAll({
    where: {
      feedback_id: feedbackId,
      author_slack_id: authorSlackId,
      manager_slack_id: managerSlackId,
    },
  });

  return threads.map((thread) => thread.toJSON()); // Convert Sequelize instances to plain objects
};

module.exports = { getAllFeedback, getFeedbackById, getThreadStateByThreadTs, insertFeedback, insertThreadState, getFeedbackByRecipientId, getThreadStateByFeedbackId };
