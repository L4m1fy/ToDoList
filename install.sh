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

# Function to install MongoDB
install_mongodb() {
    echo -e "${YELLOW}Installing MongoDB...${NC}"
    
    # Import MongoDB public key
    curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
        --dearmor
    
    # Create list file for MongoDB
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | \
        sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    
    # Update package list and install MongoDB
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    
    # Start MongoDB service
    sudo systemctl daemon-reload
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    # Wait for MongoDB to start
    echo -e "${YELLOW}Waiting for MongoDB to start...${NC}"
    sleep 5
    
    # Check if MongoDB is running
    if systemctl is-active --quiet mongod; then
        echo -e "${GREEN}MongoDB installed and running successfully${NC}"
    else
        echo -e "${RED}Failed to start MongoDB. Please check the logs with: sudo journalctl -u mongod${NC}"
        exit 1
    fi
}

# Function to install Node.js
install_nodejs() {
    echo -e "${YELLOW}Installing Node.js...${NC}"
    
    # Remove any existing Node.js installations
    sudo apt-get remove -y nodejs npm
    sudo apt-get autoremove -y
    
    # Install Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
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
    sudo apt-get install -y curl gnupg git build-essential
    
    # Check for Node.js
    if ! command_exists node; then
        install_nodejs
    fi
    
    # Check for MongoDB
    if ! systemctl is-active --quiet mongod; then
        install_mongodb
    fi
}

# Function to get configuration values from user
get_config() {
    echo -e "${YELLOW}Please provide the following configuration values:${NC}"
    
    # MongoDB URI
    read -p "MongoDB URI (default: mongodb://localhost:27017/todolist_dc_link): " MONGODB_URI
    MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/todolist_dc_link"}
    
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
MONGODB_URI=${MONGODB_URI}
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
    
    # Clone the repository
    git clone https://github.com/L4m1fy/ToDoList.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # Get configuration and create .env file
    get_config
    create_env_file
    
    # Install dependencies
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install --unsafe-perm
    
    echo -e "${YELLOW}Installing client dependencies...${NC}"
    cd client
    npm install --unsafe-perm
    npm run build
    cd ..
    
    # Create systemd service
    sudo bash -c "cat > /etc/systemd/system/todolist-dc-link.service << EOL
[Unit]
Description=ToDoList DC-Link Application
After=network.target mongod.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=$(which npm) start
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOL"
    
    # Start and enable the service
    sudo systemctl daemon-reload
    sudo systemctl start todolist-dc-link
    sudo systemctl enable todolist-dc-link
    
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
    sudo rm /etc/systemd/system/todolist-dc-link.service
    sudo systemctl daemon-reload
    
    # Remove installation directory
    sudo rm -rf "$INSTALL_DIR"
    
    echo -e "${GREEN}Uninstallation completed successfully!${NC}"
    
    # Ask if user wants to remove MongoDB data
    read -p "Do you want to remove MongoDB data? (y/N): " REMOVE_MONGO
    if [ "${REMOVE_MONGO,,}" = "y" ]; then
        sudo systemctl stop mongod
        sudo rm -rf /var/lib/mongodb
        echo -e "${GREEN}MongoDB data removed.${NC}"
    fi
}

# Main script
echo "ToDoList DC-Link Installer"
echo "1. Install"
echo "2. Uninstall"
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
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac
