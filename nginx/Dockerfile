# Use official NGINX base image
FROM nginx:alpine

# Set working directory
WORKDIR /etc/nginx

# Copy your custom nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Run nginx in foreground (Docker best practice)
CMD ["nginx", "-g", "daemon off;"]
