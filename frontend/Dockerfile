# Stage 1: Build the app
FROM node:20-alpine AS build-stage
WORKDIR /app

# Accept build arguments from Render
ARG VITE_AUTH_DOMAIN
ARG VITE_PROJECT_ID
ARG VITE_STORAGE_BUCKET
ARG VITE_MESSAGING_SENDER_ID
ARG VITE_APP_ID
ARG VITE_API_URL

# Map ARGs to ENVs for the 'npm run build' process
ENV VITE_AUTH_DOMAIN=$VITE_AUTH_DOMAIN \
    VITE_PROJECT_ID=$VITE_PROJECT_ID \
    VITE_STORAGE_BUCKET=$VITE_STORAGE_BUCKET \
    VITE_MESSAGING_SENDER_ID=$VITE_MESSAGING_SENDER_ID \
    VITE_APP_ID=$VITE_APP_ID \
    VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM mirror.gcr.io/library/nginx:stable-alpine

# Remove default nginx static files to prevent "Welcome to nginx" appearing
RUN rm -rf /usr/share/nginx/html/*

# Create the specific subdirectory path
RUN mkdir -p /usr/share/nginx/html/pronunciemos-app

# Copy the build output to the subdirectory
COPY --from=build-stage /app/dist /usr/share/nginx/html/pronunciemos-app

# Apply the custom Nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]