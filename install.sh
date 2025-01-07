#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default installation directory
INSTALL_DIR="/opt/todolist-dc-link"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js
install_nodejs() {
    echo -e "${YELLOW}Installing Node.js...${NC}"
    
    # Remove any existing Node.js installations
    sudo apt-get remove -y nodejs npm
    sudo apt-get autoremove -y
    
    # Install Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs build-essential sqlite3
    
    # Verify installation
    if command_exists node && command_exists npm; then
        echo -e "${GREEN}Node.js installed successfully${NC}"
        node --version
        npm --version
    else
        echo -e "${RED}Failed to install Node.js${NC}"
        exit 1
    fi
}

# Function to check and install system dependencies
check_dependencies() {
    echo -e "${YELLOW}Checking system dependencies...${NC}"
    
    # Update package list
    sudo apt-get update
    
    # Install basic dependencies
    sudo apt-get install -y curl git build-essential sqlite3
    
    # Check for Node.js
    if ! command_exists node; then
        install_nodejs
    fi
}

# Function to get configuration values from user
get_config() {
    echo -e "${YELLOW}Please provide the following configuration values:${NC}"
    
    # JWT Secret
    read -p "JWT Secret (leave empty for auto-generated): " JWT_SECRET
    JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 32)}
    
    # Discord Bot Token
    read -p "Discord Bot Token: " DISCORD_BOT_TOKEN
    while [ -z "$DISCORD_BOT_TOKEN" ]; do
        echo -e "${RED}Discord Bot Token is required!${NC}"
        read -p "Discord Bot Token: " DISCORD_BOT_TOKEN
    done
    
    # Encryption Key
    read -p "Encryption Key (leave empty for auto-generated): " ENCRYPTION_KEY
    ENCRYPTION_KEY=${ENCRYPTION_KEY:-$(openssl rand -hex 32)}
    
    # Port
    read -p "Port (default: 3000): " PORT
    PORT=${PORT:-3000}
}

# Function to create environment file
create_env_file() {
    cat > "$INSTALL_DIR/.env" << EOL
JWT_SECRET=${JWT_SECRET}
DISCORD_BOT_TOKEN=${DISCORD_BOT_TOKEN}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
PORT=${PORT}
NODE_ENV=production
EOL
}

# Function to install the application
install_app() {
    echo -e "${YELLOW}Installing ToDoList DC-Link...${NC}"
    
    # Create installation directory
    sudo mkdir -p "$INSTALL_DIR"
    sudo chown -R $USER:$USER "$INSTALL_DIR"
    
    # Copy files instead of cloning if we're already in the repo
    if [ -f "package.json" ]; then
        cp -r . "$INSTALL_DIR"
    else
        # Clone the repository
        git clone https://github.com/L4m1fy/ToDoList.git "$INSTALL_DIR"
    fi
    
    cd "$INSTALL_DIR"
    
    # Get configuration and create .env file
    get_config
    create_env_file
    
    # Install dependencies
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install
    
    echo -e "${YELLOW}Installing client dependencies...${NC}"
    cd client
    npm install
    npm run build
    cd ..
    
    # Create data directory
    mkdir -p data
    
    # Create systemd service
    sudo bash -c "cat > /lib/systemd/system/todolist-dc-link.service << EOL
[Unit]
Description=ToDoList DC-Link Application
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
EOL"
    
    # Start and enable the service
    sudo systemctl daemon-reload
    sudo systemctl enable todolist-dc-link
    sudo systemctl start todolist-dc-link
    
    echo -e "${GREEN}Installation completed successfully!${NC}"
    echo -e "The application is running at http://localhost:${PORT}"
    echo -e "To view logs: sudo journalctl -u todolist-dc-link -f"
}

# Function to uninstall the application
uninstall_app() {
    echo -e "${YELLOW}Uninstalling ToDoList DC-Link...${NC}"
    
    # Stop and disable the service
    sudo systemctl stop todolist-dc-link
    sudo systemctl disable todolist-dc-link
    sudo rm /lib/systemd/system/todolist-dc-link.service
    sudo systemctl daemon-reload
    
    # Remove installation directory
    sudo rm -rf "$INSTALL_DIR"
    
    echo -e "${GREEN}Uninstallation completed successfully!${NC}"
}

# Main script
echo "ToDoList DC-Link Installer"
echo "1. Install"
echo "2. Uninstall"

# Read option with no timeout
read -p "Choose an option (1/2): " OPTION

case $OPTION in
    1)
        check_dependencies
        install_app
        ;;
    2)
        uninstall_app
        ;;
    *)
        echo -e "${RED}Invalid option. Please choose 1 or 2.${NC}"
        exit 1
        ;;
esac
