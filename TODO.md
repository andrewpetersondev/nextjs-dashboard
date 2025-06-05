# TODO

- [x] remove console.log from production-ready code
- [ ] delete user function
- [ ] fine-tune users page and functions
- [ ] refactor definitions
- [ ] when the database is freshly created and seeded, users WILL NOT be able to use DEMO buttons, because drizzle seed is corrupting the intended data.  


----
## Server Actions

```ts
// TODO: Rewrite all functions for stateless authentication by creating cookies on the server.
/*
 *  To create a cookie I need users.id, sessions.userId, expiresAt, users.role
 *  users.id is created in database
 *  sessions.userId is created in db, may not be necessary because it gives the same info as users.id
 * expiresAt is created in code and encrypt ()
 * for  now, every user's role is set to "user" by default from the db.
 *  soon I will determine who is an admin based off an enumerated list of email addresses.
 * i do not have access to  users.role in signup () because the only thing that gets returned is users.id, so i will
 * hardcode in the user role to signup()
 * signup () can be part of the DAL because verifySessionOptimistic() is impossible without database sessions
 * */
// TODO: may need to update zod to use .safeParseAsync()
```
