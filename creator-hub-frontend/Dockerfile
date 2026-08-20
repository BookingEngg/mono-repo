# Stage 1 — build the Vite app
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite inlines VITE_* vars at build time, so this must be a build-arg, not a runtime env var
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2 — serve the static build with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Drop the base image's default.conf so only our port-3001 server block is active
# RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/creatorhub-frontend.conf

# Host nginx proxies to this port; container's own nginx doesn't own 80/443 here
EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]

# Build  :: docker buildx build --platform linux/arm64 -t <dockerhub-user>/creator-hub-frontend:latest --build-arg VITE_API_URL="https://api.example.com" .
# Run    :: docker run --rm -p 3001:3001 <dockerhub-user>/creator-hub-frontend:latest
