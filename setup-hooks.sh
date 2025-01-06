#!/bin/bash

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create post-merge hook
cat > .git/hooks/post-merge << 'EOL'
#!/bin/bash
chmod +x ./install.sh
./install.sh
EOL

# Create post-checkout hook
cat > .git/hooks/post-checkout << 'EOL'
#!/bin/bash
chmod +x ./install.sh
./install.sh
EOL

# Make hooks executable
chmod +x .git/hooks/post-merge
chmod +x .git/hooks/post-checkout

echo "Git hooks installed successfully!"
