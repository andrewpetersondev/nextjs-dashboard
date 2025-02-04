# Notes for compose.yaml

- This is not a complete file. It is just a place for notes near the finish line.

## Docker Compose

My current project uses Docker Compose to create services with only Docker. I wanted to get away from DevContainers.
DevContainers are useful, but ultimately unneeded since compose allows greater control if specific customizations are
needed. Furthermore, compose is simple, has better documentation than Devcontainers, and can easily be used in
Webstorm's debugger.

### How to Start App (up vs up --watch)

```shell
docker compose --profile debug --profile test up --watch
```

```shell
docker compose --profile debug up 
```

`docker compose --profile debug up`: This command starts the services defined in your Compose file that are
associated
with the "debug" profile. It builds, (re)creates, starts, and attaches to containers for the services. Once the
containers are up and running, the command will show the logs of the running containers, but it won't automatically
respond to changes in your source code.

```shell
docker compose --profile debug up --watch
```

`docker compose --profile debug up --watch`: This command does everything that the first command does, but it also
enables the Compose Watch feature. The --watch flag activates a file watching mode that automatically updates and
refreshes your running Compose services when you make changes to your source code.

```shell
docker compose up --watch
```

```shell
docker compose up
```

#### Watch

The Watch feature was introduced in Docker Compose version 2.22.0 and became generally available (GA) in version 2.24.1.
Here's what it does:
It monitors the files and directories specified in your watch configuration within the Compose file.
When changes are detected in the watched files, it automatically updates the running containers based on the specified
action (sync, rebuild, or sync+restart).
This allows for a more dynamic development experience, where your changes are immediately reflected in the running
containers without manual intervention.
For example, in your Compose file, you have a watch configuration for the web service:

```yaml
develop:
  watch:
    - path: .
      action: sync
      target: /workspace
      ignore:
        - node_modules
```

With the --watch flag, any changes you make to files in the current directory (except for those in node_modules) will be
automatically synced to the /workspace directory in the container.
To use this feature, you need to have Docker Compose version 2.22.0 or later. You can check your version with docker
compose version.

## Big Concern = Setup Debugging

- Docker had a major update today and I do not see much support for the updates.
- the documentation for setting up profiles is almost nonexistent

### Debugging: Extend Services to setup debugging capability

- in root directory but can be in .docker/ if desired
- Top Level
    - services, volumes
- Services
    - used to build images or **extend** services

#### Warnings About Extending Services

1. volumes_from and depends_on are never shared between services using extends.
    1. My web service heavily depends on db service.
    2. My web service might need to share volumes
    3. So, extends is probably not ideal

#### Debugging via extending services does not appear viable, actually it might be alright

```yaml
services:

  web:
    build:
      context: .
      dockerfile: Dockerfile
    depends_on:
      db:
        condition: service_healthy
    env_file:
      - .env
    ports:
      - "3000:3000"
    command: npm run dev
    develop:
      watch:
        - path: .
          action: sync
          target: /workspace
          ignore:
            - node_modules
    environment:
      - NODE_ENV=development
    profiles:
      - debug
  #      - test

  web-debug:
    extends:
      service: web
    command: npm run dev -- --inspect=0.0.0.0:9229
    ports:
      - "9229:9229"
    environment:
      - DEBUG=true
    #      - DEBUG=1 # this was in an official docker example
    profiles:
      - debug

  # commenting out until I figure out how to extend multiple services onto one base service
  #    web-test:
  #      extends:
  #        service: web
  #      command: npm run test
  #      profiles:
  #        - test


  db:
    image: postgres:17
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
      -
volumes:
  db-data:

```
