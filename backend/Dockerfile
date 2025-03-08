# Use the official Node.js LTS image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Install dependencies early to leverage Docker cache
COPY package*.json tsconfig.json ./
RUN npm install

# Copy the entire application source code
COPY . .

# Expose the application port
EXPOSE 3000

# Set the command to run the application
CMD ["npm", "run", "start"]
