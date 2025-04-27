# revbot.js

`revbot.js` is a Node.js library for building bots on the Revolt platform. It provides an easy-to-use interface for interacting with Revolt's API, managing events, and handling various bot functionalities.

## Installation

To use `revbot.js`, you need to have [Node.js](https://nodejs.org/) installed. Then, install the library and its dependencies using Yarn:

```bash
yarn install
```

## Basic Setup

Below is an example of how to set up a basic bot using `revbot.js`:

### Example Code

```ts
// filepath: src/bot.ts
import { client } from "./client/client";

const bot = new client({});

bot.on("ready", () => {
  console.log("Bot is ready!");
});

bot.on("message", (message) => {
  if (message.content === "ping") {
    message.reply("pong");
  }
});

bot.login("YOUR_BOT_TOKEN");
```

### Running the Bot

1. Replace `YOUR_BOT_TOKEN` with your actual bot token.
2. Build the project:

   ```bash
   yarn build
   ```

3. Run the bot:

   ```bash
   node dist/bot.js
   ```

## Features

- Event-based architecture for handling messages, server updates, and more.
- Easy-to-use managers for channels, servers, users, and roles.
- REST API client for making custom API calls.
- WebSocket support for real-time interactions.

## Development

To contribute or modify the library:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/revbot.js.git
   cd revbot.js
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Build the project:

   ```bash
   yarn build
   ```

4. Run the test client:

   ```bash
   yarn testClient
   ```

## License

This project is licensed under the MIT License.
