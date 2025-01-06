# ToDoList DC-Link

A modern task management application with team communication features and Discord integration.

## Features

- User authentication with optional 2FA
- Project management
- Task management
- Real-time team chat
- Discord bot integration
- Dark/Light theme support

## Tech Stack

- Frontend: React.js with Material-UI
- Backend: Node.js with Express
- Database: MongoDB
- Real-time Communication: Socket.IO
- Authentication: JWT with 2FA support
- Encryption: CryptoJS
- Discord Integration: Discord.js

## Installation on Linux Server

### Prerequisites

The installer will automatically check and install these dependencies if missing:
- Node.js 18.x or later
- MongoDB 6.0 or later
- Git

### Quick Installation

1. Download the installer script:
```bash
wget https://raw.githubusercontent.com/L4m1fy/ToDoList/main/install.sh
```

2. Make it executable:
```bash
chmod +x install.sh
```

3. Run the installer:
```bash
./install.sh
```

4. Follow the prompts to configure your installation. You will need:
   - MongoDB URI (optional, defaults to local MongoDB)
   - JWT Secret (optional, auto-generated if not provided)
   - Discord Bot Token (required)
   - Encryption Key (optional, auto-generated if not provided)
   - Port number (optional, defaults to 3000)

### Post-Installation

After installation:
- The application will be installed in `/opt/todolist-dc-link`
- A systemd service will be created and started automatically
- The application will be accessible at `http://your-server-ip:PORT`

### Managing the Application

- View logs: `sudo journalctl -u todolist-dc-link -f`
- Start service: `sudo systemctl start todolist-dc-link`
- Stop service: `sudo systemctl stop todolist-dc-link`
- Restart service: `sudo systemctl restart todolist-dc-link`
- Check status: `sudo systemctl status todolist-dc-link`

### Uninstallation

To uninstall the application:

1. Run the installer script:
```bash
./install.sh
```

2. Choose option 2 (Uninstall)
3. Decide whether to remove MongoDB data when prompted

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
