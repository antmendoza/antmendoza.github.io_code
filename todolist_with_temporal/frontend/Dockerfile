# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to /app
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source code to /app
COPY . .

RUN npm install -g @angular/cli


EXPOSE 4200

# Start the app
CMD ["ng", "serve", "--host", "0.0.0.0"]
