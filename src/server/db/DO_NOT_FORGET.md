# DO NOT FORGET

- Database schema is also needed for cli tools (drizzle-kit) and test support (dev tools) and testing (cypress). 
- Those folders do not play well with tsconfig path aliases so `devtools` and `cypress` need to use relative paths.
