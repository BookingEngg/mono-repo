FROM node:20-alpine

WORKDIR /app

# Install gettext for envsubst, Git and dos2unix (for line-ending conversion)
RUN apk add --no-cache gettext git bash dos2unix

# Copy the clone_repo script to the container and give it execute permissions
COPY clone_repo.sh /clone_repo.sh

# Convert Windows line endings to Unix line endings
RUN dos2unix /clone_repo.sh

# Make the script executable
RUN chmod +x /clone_repo.sh

# Run the clone_repo script (use full path and bash explicitly)
ARG GITHUB_PAT
RUN GITHUB_PAT=${GITHUB_PAT} /bin/bash /clone_repo.sh

# # Install dependencies early to leverage Docker cache
# RUN npm install

# # Build the application
# RUN npm run build

# Expose Cloud Run port

# Use official NGINX base image
FROM nginx:alpine

# Set working directory
WORKDIR /etc/nginx

# Copy the template
COPY nginx.conf /etc/nginx/templates/nginx.conf.template

# On container start, substitute $PORT into config and start nginx
CMD envsubst '$PORT' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf \
    && exec nginx -g 'daemon off;'

EXPOSE 8080
