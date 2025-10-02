# Stage 1: Build the React application
# This stage uses a Node.js environment to compile your React code.
FROM node:18-alpine as builder

WORKDIR /app

# Copy package.json and install dependencies first to leverage Docker's layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application for production. This creates a 'dist' folder.
RUN npm run build

# Stage 2: Serve the application using a lightweight Nginx web server
# This stage takes the result from Stage 1 and serves it.
FROM nginx:1.21-alpine

# Copy the final Nginx configuration file into the container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React application from the 'builder' stage into Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 to allow traffic to the Nginx server
EXPOSE 80

# The default command for the nginx image is to start the server,
# so we don't need to specify it. This is clean and standard.
CMD ["nginx", "-g", "daemon off;"]