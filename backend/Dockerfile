# Use the official Node.js LTS image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Install dependencies early to leverage Docker cache
COPY package*.json tsconfig.json ./
RUN npm install

# Copy the entire application source code
COPY . .

# Install Git (if it's not included in the base image)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copy the fetch-config script and give it execute permissions
COPY fetch-config.sh /fetch-config.sh
RUN chmod +x /fetch-config.sh

# Fetch the config file
ARG GITHUB_PAT
RUN GITHUB_PAT=${GITHUB_PAT} /fetch-config.sh

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 8080

# Set the command to run the application
CMD ["npm", "run", "prod"]
