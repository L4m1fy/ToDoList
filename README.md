# ToDoList DC-Link

A modern to-do list application with team communication and Discord integration.

## Features

- Task Management
- Team Chat
- Discord Integration
- Real-time Updates
- User Authentication

## Quick Installation

Run this command to start the interactive installation:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/L4m1fy/ToDoList/main/install-remote.sh)
```

The installer will:
1. Ask if you want to install or uninstall
2. Install required dependencies (Node.js, SQLite)
3. Ask for your Discord Bot Token
4. Set up the application
5. Start the service

## Manual Installation

If you prefer to install manually:

```bash
git clone https://github.com/L4m1fy/ToDoList.git
cd ToDoList
chmod +x install.sh
./install.sh
```

## Development Setup

1. Install dependencies:
```bash
npm install
cd client
npm install
cd ..
```

2. Create a `.env` file with the following variables:
```
JWT_SECRET=your_jwt_secret
DISCORD_BOT_TOKEN=your_discord_bot_token
ENCRYPTION_KEY=your_encryption_key
PORT=3000
NODE_ENV=development
```

3. Start the development server:
```bash
# Start the backend
npm run dev

# In another terminal, start the frontend
cd client
npm start
```

## Environment Variables

- `JWT_SECRET`: Secret key for JWT token generation
- `DISCORD_BOT_TOKEN`: Your Discord bot token
- `ENCRYPTION_KEY`: Key for encrypting chat messages
- `PORT`: Port number for the server (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## Uninstallation

To uninstall the application:

```bash
./install.sh
# Choose option 2 (Uninstall)
```

## License

ISC
