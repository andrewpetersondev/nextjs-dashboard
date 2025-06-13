# Cypress

## How to run Cypress tests

Open a terminal and run the following command:

```bash
hcp vault-secrets run -- pnpm dev
```

Open another terminal and run the following command to start the server:

```bash
hcp vault-secrets run -- pnpm cypress open
``` 

## E2E Headless mode 

```bash
hcp vault-secrets run -- pnpm dev
```

Open another terminal and run the following command to start the server:

```bash
hcp vault-secrets run -- pnpm cypress run --e2e
``` 
