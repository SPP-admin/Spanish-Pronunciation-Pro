# Use Nginx to serve the static files
FROM mirror.gcr.io/library/nginx:stable-alpine

# Copy your built 'dist' folder contents into the Nginx container
COPY dist /usr/share/nginx/html

COPY default.conf /etc/nginx/conf.d/default.conf


EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]