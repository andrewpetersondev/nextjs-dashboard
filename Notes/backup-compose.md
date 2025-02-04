This is a backup of my compose.yaml file

```yaml
name: nextjs-dashboard

services:
  web:
    container_name: web
    restart: no
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - .:/workspace
    depends_on:
      - db
    #        db:
    #        condition: service_healthy
    env_file:
      - .env
    ports:
      - "3000:3000"
      - "9229:9229"
    command: npm run dev # can this just be an empty string when i am using debugger?
    environment:
      - NODE_ENV=development
      - NODE_OPTIONS=--inspect=0.0.0.0:9229
#      - DEBUG=true
  #    develop: # this might be starting inadvertent container startup
  #      watch:
  #        - path: .
  #          action: sync
  #          target: /workspace
  #          ignore:
  #            - node_modules
  #            - .next
  #            - .git
  #    healthcheck: # this might be causing containers to start unintentionally
  #      test: [ "CMD-SHELL", "curl -f http://localhost:3000 || exit 1" ]
  #      interval: 30s
  #      timeout: 10s
  #      retries: 3
  #      start_period: 30s
  db:
    container_name: dashboard-db
    image: postgres:17
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    post_start:
      - command: sh -c "until pg_isready -U postgres; do sleep 1; done"
        user: postgres
      - command: |
          psql -U postgres <<EOF
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'postgres') THEN
              CREATE DATABASE postgres;
            END IF;
          END $$;
          EOF
        user: postgres

    #    pre_stop:
    #      - command: "echo 'Stopping the container ...' "
    #      - user: postgres
    #    post_start:
    #      - command: sh -c "until pg_isready -U postgres; do sleep 1; done"
    #        user: postgres
    #      - command: psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'postgres'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE postgres"
    #        user: postgres
    #      - command: psql -U postgres -d postgres -c "CREATE SCHEMA IF NOT EXISTS myschema"
    #        user: postgres
    healthcheck:
      test: [ "CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}" ]
      interval: 10s
      retries: 5
      start_period: 60s
      timeout: 10s

  # why does this create so many running containers even though i am not running any docker containers
  # it is literally creating them from death
  #  web-debug:
  #    container_name: web-debug
  #    extends:
  #      service: web
  #    depends_on: # depends_on and volumes_from was removed by ghcc
  #      web:
  #        condition: service_healthy
  #    volumes_from:
  #      - web
  #    command: ''
  #    ports:
  #      - "9229:9229" # debugging port for node
  #    environment:
  #      - DEBUG=true
  #    profiles:
  #      - debug

  #   commenting out until I figure out how to extend multiple services onto one base service
#  web-test:
#    extends:
#      service: web
#    command: npm run test
#    profiles:
#      - test

volumes:
  db-data:

```
