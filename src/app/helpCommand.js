const {respondToSlashCommand} = require("../utils/slack-utils");

async function handleHelpCommand({ response_url }) {
  await respondToSlashCommand(response_url, `
    Hello! 👋 I’m here to help you manage feedback. Here’s what I can do:\n
    :one: *Submit Feedback*:\n
           - Share feedback about someone confidentially.\n
           - *Format*: \`/give-feedback @recipient your feedback\`\n
           - *Example*: \`/give-feedback @john_doe Great job on the project!\`\n
    💡 _Note: you can do this anywhere, in any chat, any time, it will only be seen by you as it's ephemeral messaging. If you have any doubts - do it in your own DMs or with me._
    
    :two: *Retrieve Feedback (Managers Only)*:\n
           - View feedback submitted for one or more people.\n
           - *Format*: \`\get-feedback <password> @recipient1, @recipient2...\`\n
           - *Example*: \`\get-feedback secret123 @john_doe, @jane_smith\`\n
    💡 _Note: you can do this anywhere, in any chat, any time, it will only be seen by you as it's ephemeral messaging. If you have any doubts - do it in your own DMs or with me._
          
    :three: *Help*:\n
           - Get this Elmo help message anytime.\n
           - *Command*: \`\help\`\n
          
    💡 _Note: All messages sent to me are confidential and will be deleted after processing. No names and emails are being saved and feedback is encrypted_\n\n
    :tea_kermit: _Managers can also initiate a confidential & anonymous discussion about specific feedback item, Kermit will act as a middle man to convey the messages and keep both parties anonymous. When this happens a private thread will be initiated in both people DM chats with Kermit, where they can communicate in the thread._
  `);
}

module.exports = { handleHelpCommand };
