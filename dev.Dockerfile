# syntax=docker.io/docker/dockerfile:1

FROM node

WORKDIR /project

COPY . /project

# Copy the startup script into the container
COPY start-dev.sh ./start-dev.sh

# Ensure the script is executable in the container
RUN chmod +x ./start-dev.sh

# Use the exec form for CMD
CMD ["./start-dev.sh"]