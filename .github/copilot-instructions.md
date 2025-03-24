# GitHub Copilot Instructions

## Copilot Code Responses

If showing code changes always indicate what has changed by highlights or comments inside the code block.

When using GitHub Copilot Chat in the Webstorm IDE, always use blue color to show the code suggestions in the chat panel.

Next.js Application uses:
- Next.js v15^
- App Router 
- Typescript v5^
- turbopack 
- import aliases
- Tailwind CSS version ^4
- node v23^
- Postgresql v17^
- Drizzle via drizzle-orm v0.4^
- React v19^
- React Dom v19^

Docker Setup uses:
- docker compose v2.33^
- node image for web service
- postgresql image for db service
- adminer image for adminer service
- secrets

Environments
- Development
- Production
- Testing

## Package Versions

```json
 "dependencies": {
    "@heroicons/react": "^2.2.0",
    "@next/env": "^15.2.2",
    "@tailwindcss/forms": "^0.5.10",
    "@typescript-eslint/eslint-plugin": "^8.21.0",
    "@typescript-eslint/parser": "^8.21.0",
    "autoprefixer": "^10.4.21",
    "bcryptjs": "^3.0.2",
    "clsx": "^2.1.1",
    "dotenv": "^16.4.7",
    "drizzle-orm": "^0.40.1",
    "drizzle-zod": "^0.7.0",
    "jose": "^6.0.10",
    "next": "^15.2.3",
    "pg": "^8.14.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "server-only": "^0.0.1",
    "use-debounce": "^10.0.4",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.1",
    "@eslint/js": "^9.19.0",
    "@headlessui/react": "^2.2.0",
    "@tailwindcss/postcss": "^4.0.15",
    "@testcontainers/postgresql": "^10.21.0",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/react": "^16.2.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22.13.11",
    "@types/pg": "^8.11.11",
    "@types/react": "^19.0.12",
    "@types/react-dom": "^19.0.4",
    "aria-query": "^5.3.2",
    "depcheck": "^1.4.7",
    "drizzle-kit": "^0.30.5",
    "drizzle-seed": "^0.3.1",
    "eslint": "^9.23.0",
    "eslint-config-next": "^15.2.3",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-drizzle": "^0.2.3",
    "eslint-plugin-react": "^7.37.4",
    "globals": "^16.0.0",
    "postcss": "^8.5.3",
    "prettier": "^3.5.3",
    "prettier-plugin-tailwindcss": "^0.6.11",
    "tailwindcss": "^4.0.14",
    "testcontainers": "^10.21.0",
    "ts-node": "^10.9.2",
    "tsx": "^4.19.3",
    "typescript": "^5.8.2",
    "typescript-eslint": "^8.27.0"
  },
```