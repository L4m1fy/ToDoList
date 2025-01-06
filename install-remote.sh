#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing ToDoList DC-Link...${NC}"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Clone the repository
echo -e "${YELLOW}Cloning repository...${NC}"
git clone https://github.com/L4m1fy/ToDoList.git
cd ToDoList

# Make install script executable and run it
chmod +x install.sh
./install.sh

echo -e "${GREEN}Installation complete!${NC}"
