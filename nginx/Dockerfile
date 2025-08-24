# Use official NGINX base image
FROM nginx:alpine

# Set working directory
WORKDIR /etc/nginx

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Copy the template
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

# On container start, substitute $PORT into config and start nginx
CMD envsubst '$PORT' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf \
    && exec nginx -g 'daemon off;'

# Expose Cloud Run port
EXPOSE 8080
