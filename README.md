# Feedback Bot

Feedback Bot is a Slack application designed to help teams collect, manage, and discuss feedback anonymously and securely. It enables users to submit feedback, managers to retrieve and discuss it, and ensures all communication remains confidential.

## Features

- **Submit Feedback**: Users can share feedback about colleagues securely.
- **Retrieve Feedback**: Managers can retrieve feedback for one or more team members with a secure password.
- **Anonymous Discussions**: Managers and feedback authors can discuss specific feedback anonymously in private threads.
- **Message Cleanup**: Bot messages and history can be cleared for confidentiality.

## Slash Commands

### `/give-feedback`
- **Description**: Submit feedback about a colleague confidentially.
- **Usage**: `/give-feedback @recipient your feedback`
- **Example**: `/give-feedback @john_doe Great work on the project!`

### `/get-feedback`
- **Description**: (Managers only) Retrieve feedback for one or more team members.
- **Usage**: `/get-feedback <password> @recipient1, @recipient2...`
- **Example**: `/get-feedback secret123 @john_doe, @jane_smith`

### `/delete-history`
- **Description**: Clear all bot messages in your chat for confidentiality.
- **Usage**: `/delete-history`

### `/help`
- **Description**: View help information and usage instructions.
- **Usage**: `/help`

## Installation

1. Clone this repository.
   ```bash
   git clone https://github.com/your-repo/feedback-bot.git
   cd feedback-bot
   ```

2. Install dependencies.
   ```bash
   npm install
   ```

3. Set up the `.env` file with the following keys:
   ```dotenv
   SLACK_BOT_TOKEN=your-slack-bot-token
   PORT=80
   MANAGER_PASSWORD=your-manager-password
   OPENAI_API_KEY=your-openai-api-key
   ENCRYPTION_KEY=your-encryption-key
   ```

4. Start the application.
   ```bash
   npm start
   ```

## Database

The bot uses SQLite to store feedback and thread states. Tables include:
- **`feedback`**: Stores encrypted feedback with details about the author, recipient, and date.
- **`threads`**: Tracks ongoing anonymous discussions between managers and feedback authors.

## Security

- **Encryption**: Feedback is encrypted using the `ENCRYPTION_KEY` from the `.env` file.
- **Ephemeral Messages**: Bot responses are ephemeral and visible only to the user.
- **Confidentiality**: Messages are deleted after processing to maintain confidentiality.

## Development

### Running Locally
1. Set up a local Slack app and obtain a bot token.
2. Configure your `.env` file with appropriate credentials.
3. Run the application with:
   ```bash
   npm run dev
   ```

### API Keys
The app integrates with OpenAI for feedback summarization. Ensure your `OPENAI_API_KEY` is valid and active.

## Adding and Configuring the Slack App

To deploy this Slack application, you need to configure it in Slack using a `manifest.json` file. Follow these steps to set up and host your own version:

# Initial Setup for Slack Workspace
### 1. Create a Slack App

1. Go to the [Slack API App Management](https://api.slack.com/apps).
2. Click on **"Create an App"** and choose **"From an app manifest"**.
3. Select the workspace where you want to install the app and click **Next**.
4. Paste the contents of the `slack-app-manifest.json` file into the editor.

### 2. Update URLs in the Manifest

Replace placeholders in the `slack-app-manifest.json` file with the URLs you will use to host your application:
- **Slash Commands URLs**: Update `url` fields in the `features.slash_commands` section.
- **Event Subscription URL**: Update the `request_url` in `settings.event_subscriptions`.
- **Interactivity URL**: Update the `request_url` in `settings.interactivity`.

Example:
```json
"features": {
  "slash_commands": [
    {
      "command": "/give-feedback",
      "url": "https://your-domain.com/slack/commands",
      "description": "Anonymous feedback.",
      "usage_hint": "@username your feedback",
      "should_escape": true
    }
  ]
}
```

### 3. Install the App to Your Workspace

1. Once the manifest is uploaded, click **Next** and review the settings.
2. Click **Create** to finalize your app.
3. Install the app to your workspace by clicking **Install App** in the settings sidebar.

### 4. Generate the Bot Token (`xoxb-...`)

1. In your Slack app dashboard, go to **OAuth & Permissions**.
2. Click **Install to Workspace** and follow the prompts.
3. Once installed, you’ll see the **Bot User OAuth Token**.
4. Copy the token and add it to your `.env` file under `SLACK_BOT_TOKEN`:
   ```env
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   ```

### 5. Set Up the Hosting Environment

1. Deploy your app to your hosting platform (e.g., AWS, Heroku, or a custom server).
2. Ensure your hosting environment supports HTTPS, as Slack requires secure endpoints.
3. Update your app's environment variables (copy `.env` into `.env.local`) and edit the following:
   ```env
   PORT=80
   MANAGER_PASSWORD=your-manager-password
   OPENAI_API_KEY=your-openai-api-key
   ENCRYPTION_KEY=your-encryption-key
   ```

### 6. Testing the App

1. Use the `/give-feedback`, `/get-feedback`, and `/help` commands in your Slack workspace to test the app functionality.
2. Confirm that:
   - Feedback is submitted and stored securely.
   - Feedback retrieval works for managers.
   - Commands respond appropriately in Slack.

### 7. Updating the Manifest

If you make changes to your app's functionality or endpoints, no need to update the `slack-app-manifest.json`.

### 8. Additional Resources

- [Slack API Documentation](https://api.slack.com/)
- [Manifest File Reference](https://api.slack.com/reference/manifests)

By following these steps, you’ll have a fully functional Slack app ready for use in your workspace.

## Contribution

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact

For issues or inquiries, please contact the repository owner or submit an issue via GitHub.
