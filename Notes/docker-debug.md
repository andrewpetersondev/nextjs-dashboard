For running a dev server with debugging in WebStorm, especially with Docker, here's a detailed approach:

### Package.json Script Configuration

```json
{
  "scripts": {
    "dev": "next dev",
    "debug": "node --inspect=0.0.0.0:9229 node_modules/.bin/next dev",
    "debug:docker": "nodemon --inspect=0.0.0.0:9229 node_modules/.bin/next dev"
  }
}
```

### WebStorm Debugging Configuration

#### Local Debugging

1. Go to **Run > Edit Configurations**.
2. Click the "+" icon and select **Node.js Remote Debug**.
3. Set the host to `localhost` and the port to `9229`.
4. Name the configuration (e.g., "Next.js Debug").

#### Docker Debugging

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
      - "9229:9229"
    command: npm run debug:docker
    volumes:
      - .:/app
    environment:
      - NODE_OPTIONS=--inspect=0.0.0.0:9229
```

### Dockerfile Modifications

```dockerfile
# Enable debugging
EXPOSE 9229
ENV NODE_OPTIONS=--inspect=0.0.0.0:9229
```

### Key Debugging Tips

- The `--inspect` flag enables Node.js debugging.
- Using `0.0.0.0` allows debugging from outside the container.
- Port `9229` is the standard Node.js debugging port.

### WebStorm Setup

1. Create a new **Remote Debug** configuration in WebStorm.
2. Set the host to `localhost` (or replace it with your Docker machine IP if needed).
3. Set the port to `9229`.
4. Save and start debugging.

### Debugging Workflows

- **Local debugging**: `npm run debug`
- **Docker debugging**: `docker-compose up --build`
- **WebStorm debugging**: Use the Remote Debug configuration.
