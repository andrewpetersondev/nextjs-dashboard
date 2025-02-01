# syntax=docker.io/docker/dockerfile:1

# Development stage
# ====================================================================

# Use the official Node.js image as a parent image
FROM node:23.5


# Create a non-root user
# RUN adduser --disabled-password --gecos "" web

# Set the working directory
WORKDIR /workspace

# Copy package.json and package-lock.json
# COPY --chown=web:web package*.json ./
COPY package*.json ./


# Install dependencies
RUN npm install

# Copy the rest of the application code
# COPY --chown=web:web . .
COPY . .


# Change ownership of the workspace directory
# RUN chown -R web:web /workspace

# Switch to the non-root user
# USER web

# Expose the port the app runs on
EXPOSE 3000 9229

# Command to run the application
CMD ["npm", "run", "dev"]

