## LOCAL ONLY
# # Stage 1: Build the React application
# FROM node:18-alpine as builder

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# RUN npm run build

# # Stage 2: Serve the application using a lightweight web server
# FROM nginx:1.21-alpine

# # Copy the custom Nginx configuration
# # This will overwrite the default settings
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Copy the built React app from the builder stage
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Expose port 80
# EXPOSE 80

# # When the container starts, nginx will serve the files
# CMD ["nginx", "-g", "daemon off;"]


## DEPLOYMENT CI/CD
# Stage 1: Build the React application
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the application using a lightweight web server
FROM nginx:1.21-alpine

# Declare an argument that can be passed in during the build
ARG BACKEND_URL
ENV BACKEND_URL=${BACKEND_URL}

# Copy the Nginx config as a template
COPY nginx.conf /etc/nginx/nginx.template.conf

# Copy the built React app from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# When the container starts, this command substitutes the variable in the config
# and then starts the Nginx server.
CMD /bin/sh -c "envsubst '$BACKEND_URL' < /etc/nginx/nginx.template.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"