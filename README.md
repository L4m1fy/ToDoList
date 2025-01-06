# ToDoList DC-Link

A modern task management application with team communication features and Discord integration.

## Features

- User authentication with optional 2FA
- Project management
- Task management
- Real-time team chat
- Discord bot integration
- Dark/Light theme support

## Quick Installation

Simply clone the repository and the installer will run automatically:

```bash
git clone https://github.com/L4m1fy/ToDoList.git
```

The installer will:
1. Install required dependencies (Node.js, MongoDB)
2. Set up the application
3. Configure the service
4. Start the application

## Manual Installation

If the automatic installation doesn't start, you can run it manually:

```bash
chmod +x install.sh
./install.sh
```

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/L4m1fy/ToDoList.git
cd ToDoList
```

2. Install dependencies:
```bash
npm install
cd client
npm install
cd ..
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/todolist_dc_link
JWT_SECRET=your_jwt_secret
DISCORD_BOT_TOKEN=your_discord_bot_token
ENCRYPTION_KEY=your_encryption_key
PORT=3000
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
├── client/             # Frontend React application
├── server/             # Backend Node.js server
├── discord-bot/        # Discord bot implementation
├── config/            # Configuration files
└── docs/             # Documentation
```

## Security

- All passwords are hashed using bcrypt
- Chat messages are encrypted using AES-256
- Optional 2FA using TOTP
- JWT for secure authentication

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
