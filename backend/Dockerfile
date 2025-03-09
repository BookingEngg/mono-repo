# Use the official Node.js LTS image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Install dependencies early to leverage Docker cache
COPY package*.json tsconfig.json ./
RUN npm install

# Copy the entire application source code
COPY . .

# Install Git and dos2unix (for line-ending conversion)
RUN apt-get update && apt-get install -y git bash dos2unix && rm -rf /var/lib/apt/lists/*

# Copy the fetch-config script to the container and give it execute permissions
COPY fetch-config.sh /fetch-config.sh

# Convert Windows line endings to Unix line endings
RUN dos2unix /fetch-config.sh

# Make the script executable
RUN chmod +x /fetch-config.sh

# Run the fetch-config script (use full path and bash explicitly)
ARG GITHUB_PAT
RUN GITHUB_PAT=${GITHUB_PAT} /bin/bash /fetch-config.sh

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 8080

# Set the command to run the application
CMD ["npm", "run", "prod"]

# Build Container :: docker-compose build --build-arg GITHUB_PAT="github-secret-repo-pat"
# Run Docker Container :: docker-compose up
