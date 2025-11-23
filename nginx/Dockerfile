###
### STAGE 1 — Clone + Build Frontend
###
FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache git bash dos2unix

# Copy scripts
COPY clone_repo.sh /clone_repo.sh
COPY build_frontend.sh /build_frontend.sh

RUN dos2unix /clone_repo.sh /build_frontend.sh
RUN chmod +x /clone_repo.sh /build_frontend.sh

# Clone the GitHub repo
ARG GITHUB_PAT
RUN GITHUB_PAT=$GITHUB_PAT bash /clone_repo.sh

# Build the frontend
RUN bash /build_frontend.sh


###
### STAGE 2 — NGINX Deploy
###
FROM nginx:alpine

WORKDIR /etc/nginx

# Copy NGINX template
COPY nginx.conf /etc/nginx/templates/nginx.conf.template

# Copy built frontend to NGINX html folder
COPY --from=build /app/repo/frontend /opt/github_repo/frontend

CMD envsubst '$PORT' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf \
    && exec nginx -g 'daemon off;'

EXPOSE 80
